import Spinner from '../Spinner'

export default function LoadingState({
  title = 'Loading...',
  message = 'Please wait while we fetch your data.'
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Spinner />
      <h3 className="text-lg font-semibold text-gray-900 mt-4">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-md text-center">{message}</p>
    </div>
  )
}
