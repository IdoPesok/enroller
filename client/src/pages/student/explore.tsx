import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Search } from "@/components/ui/search"
import { trpc } from "@/lib/trpc"
import { ReactMarkdown } from "react-markdown/lib/react-markdown"
import { Stars, Wand } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { ChatItem } from "@/components/explore/chat-item"

interface Chat {
  message: string
  response: string
  error: 0 | 1
  errorMessage?: string
}

export default function Courses() {
  const [promptInput, setPromptInput] = useState("")
  const [prompt, setSearch] = useState("")
  const [filterDatabase, setFilterDatabase] = useState(true)
  const [chatHistory, setChatHistory] = useState<Chat[]>([])
  const user = useUser()

  const clearUserInput = () => {
    setPromptInput("")
    setSearch("")
  }

  const exploreMutation = trpc.explore.prompt.useMutation({
    onSuccess: (data) => {
      setChatHistory((prev) => [
        {
          message: promptInput,
          response: data ?? "No response was given.",
          error: 0,
        },
        ...prev,
      ])
      clearUserInput()
    },
    onError: (error) => {
      setChatHistory((prev) => [
        {
          message: promptInput,
          response: "There has been an error. Please try again later.",
          error: 1,
          errorMessage: error.message,
        },
        ...prev,
      ])
      clearUserInput()
    },
  })

  const handleExplore = () => {
    exploreMutation.mutateAsync({
      prompt: promptInput,
      filterDatabase,
    })
  }

  const interestQuestions = [
    "I want a course that integrates physics and computer science.",
    "What are the best courses for learning about machine learning?",
    "What are the best courses for learning about web development?",
  ]

  const interestCards = interestQuestions.map((question) => (
    <div
      className="mb-3 bg-slate-100 rounded py-3 px-3 border flex gap-3 hover:border hover:border-emerald-500 cursor-pointer"
      key={question}
      onClick={() => {
        setSearch(question)
        setPromptInput(question)
        handleExplore()
      }}
    >
      <Stars className="text-emerald-500" />
      {question}
    </div>
  ))

  const userMessage = (message: string) => (
    <ChatItem
      message={message}
      userIcon={
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.user?.profileImageUrl} alt="@shadcn" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
      }
    />
  )

  const skeletonLoader = (
    <div className="animate-pulse flex gap-4 flex-col">
      <div className="h-6 bg-slate-200 rounded w-full"></div>
      <div className="h-6 bg-slate-200 rounded w-full"></div>
      <div className="h-6 bg-slate-200 rounded w-1/2"></div>
    </div>
  )

  const skeletonChat = (
    <>
      {userMessage(promptInput)}
      <ChatItem
        message={skeletonLoader}
        userIcon={<Wand className="text-white" size={18} />}
      />
    </>
  )

  const emptyChatHistory = (
    <div className="flex-1 justify-center items-center mt-10">
      <h3 className="mb-5">You might be interested in:</h3>
      {interestCards}
    </div>
  )

  const chats = chatHistory.map((chat) => (
    <>
      {userMessage(chat.message)}
      <ChatItem
        message={
          chat.error === 0 ? (
            <ReactMarkdown>{chat.response}</ReactMarkdown>
          ) : (
            <p className="text-red-500">{`${chat.response} - ${
              chat.errorMessage ?? "No Error Message"
            }`}</p>
          )
        }
        userIcon={<Wand className="text-white" size={18} />}
      />
    </>
  ))

  return (
    <div className="mx-auto max-w-2xl flex flex-col mt-10">
      <Search
        placeholder="Ask anything about Cal Poly courses..."
        disabled={exploreMutation.isLoading && Boolean(prompt)}
        value={promptInput}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setSearch(e.currentTarget.value)
            handleExplore()
          }
        }}
        onChange={(e) => {
          setPromptInput(e.currentTarget.value)
          if (!Boolean(e.currentTarget.value)) {
            setSearch("")
          }
        }}
      />
      {chatHistory.length === 0 && !exploreMutation.isLoading ? (
        emptyChatHistory
      ) : (
        <div className="flex gap-8 flex-col mt-10">
          {exploreMutation.isLoading && skeletonChat}
          {chats}
        </div>
      )}
    </div>
  )
}
