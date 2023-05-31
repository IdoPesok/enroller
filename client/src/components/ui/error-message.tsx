type Props = {
  message: string
}

export const ErrorMessage = ({ message }: Props) => {
  return (
    <div className="flex justify-center items-center gap-10 py-20 flex-col">
      <h1 className="font-extrabold text-transparent text-3xl bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
        Oops!
      </h1>
      <p>{message}</p>
    </div>
  )
}

export default ErrorMessage
