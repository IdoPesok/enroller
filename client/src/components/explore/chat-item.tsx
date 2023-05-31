interface Props {
  userIcon: JSX.Element,
  message: string | JSX.Element
}

export const ChatItem = ({ userIcon, message }: Props) => {
  return (
    <div className="flex items-start justify-start px-2">
      <div className="rounded-full bg-emerald-500 h-8 w-8 flex items-center justify-center mr-6">
        { userIcon }
      </div>
      <div className="w-full flex-1 mt-1">
        { message }
      </div>
    </div>
  )
}