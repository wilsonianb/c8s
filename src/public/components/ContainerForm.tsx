import * as React from 'react'
import { withFormik, FormikBag, FormikProps, FormikErrors, Form, Field, FieldArray, ArrayHelpers } from 'formik'
import { Manifest, ManifestOpts, EnvVar } from '../Manifest'

interface OtherProps {
  codiusVersion: string
}

const InnerForm = (props: OtherProps & FormikProps<ManifestOpts>) => {
  const { touched, errors, isSubmitting, status } = props
  return (
    <Form>
      <label>
        Docker container image URL:
        <Field type='text' name='image' placeholder='docker.io/user/image:tag' autoFocus />
        {touched.image && errors.image && <div>{errors.image}</div>}
      </label>
      <br />
      <label>
        Port:
        <Field type='number' name='port' min='1' max='65535' />
        {touched.port && errors.port && <div>{errors.port}</div>}
      </label>
      <br />
      <br />
      <FieldArray
        name='envVars'
        render={(arrayHelpers: ArrayHelpers) => (
          <div>
            {props.values.envVars.map((envVar: EnvVar, index: number) => (
              <div key={index}>
                <Field type='text' name={`envVars[${index}].name`} />
                =
                <Field type='text' name={`envVars[${index}].value`} />
                <button
                  type='button'
                  onClick={() => arrayHelpers.remove(index)}
                  title='Remove'
                >
                  -
                </button>
                <Field type='checkbox' name={`envVars[${index}].private`} checked={props.values.envVars[index].private} />
                Private
              </div>
            ))}
            <button type='button' onClick={() => arrayHelpers.push({
              name: '',
              value: '',
              private: true
            })}>
              Add environment variable
            </button>
          </div>
        )}
      />
      <br />
      <button type='submit' disabled={isSubmitting}>
        Run Container
      </button>
      <br />
      <br />

      {isSubmitting &&
        <div>
          Deploying...
        </div>
      }
      {status && status.error &&
        <div>
          {status.error}
        </div>
      }
      {status && status.containerUrl &&
        <div>
          Container is now running at <a href={status.containerUrl}>{status.containerUrl}</a>
        </div>
      }
      <br />
      {status && status.containerUrl && status.manifest &&
        <div>
          Manifest:
          <br />
          <pre>{JSON.stringify(status.manifest, null, 2)}</pre>
        </div>
      }
    </Form>
  )
}

interface MyFormProps {
  initialImage?: string
  codiusVersion: string
}

const ContainerForm = withFormik<MyFormProps, ManifestOpts>({
  displayName: 'ContainerForm',

  mapPropsToValues: (props: MyFormProps) => {
    return {
      image: props.initialImage || '',
      port: 8080,
      envVars: []
    }
  },

  // Add a custom validation function (this can be async too!)
  validate: (values: ManifestOpts) => {
    let errors: FormikErrors<ManifestOpts> = {}
    if (!values.image) {
      errors.image = 'Required'
    // } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.image)) {
    //   errors.image = 'Invalid container image'
    }
    // TODO: don't allow PORT env var
    return errors
  },

  handleSubmit: (values: ManifestOpts, { props, setStatus, setSubmitting }: FormikBag<MyFormProps, ManifestOpts>) => {
    const manifest = new Manifest(values)
    setStatus({
      error: undefined,
      containerUrl: undefined,
      manifest: undefined
    })
    return fetch('/containers', {
      headers: {
        Accept: `application/codius-v${props.codiusVersion}+json`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        manifest: manifest.manifest,
        private: manifest.private
      })
    })
    .then(response => {
      if (response.ok) {
        return response.json()
      } else {
        throw new Error()
      }
    })
    .then(result => {
      setStatus({
        containerUrl: result.url,
        manifest: manifest.manifest
      })
    })
    .catch(error => {
      setStatus({
        error: 'Unable to deploy container'
      })
    })
    .finally(() => setSubmitting(false))
  }
})(InnerForm)

export default ContainerForm
