"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, RotateCcw, Bot, User } from "lucide-react"

type Message = {
  role: "user" | "bot"
  content: string
  type?: string
  createdAt?: Date
}

export default function HobbyChatbot() {

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    setIsTyping(isLoading)
  }, [isLoading])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    const newMessage: Message = { role: "user", content: trimmed }
    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      })

      const data = await res.json()

      console.log("data", data)

      const botReply: Message = {
        role: "bot",
        content: data.message,
        type: data.type,
      }

      setMessages((prev) => [...prev, botReply])
    } catch (err) {
      console.error("Error fetching bot reply:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const restartConversation = async () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")

    if (!lastUserMessage) return

    setIsLoading(true)

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: lastUserMessage.content }),
      })

      const data = await res.json()

      console.log("🔁 Regenerated response:", data)

      const regeneratedBotReply: Message = {
        role: "bot",
        content: data.message,
        type: data.type,
      }

      setMessages((prev) => [...prev, regeneratedBotReply])
    } catch (err) {
      console.error("Error regenerating response:", err)
    } finally {
      setIsLoading(false)
    }
  }


  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(timestamp)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[90vh] flex flex-col shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="bg-white/20">
                  <AvatarFallback className="bg-transparent text-white">
                    <Bot className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">Hobby Finder Bot</CardTitle>
                  <p className="text-blue-100 text-sm">Discover your perfect hobby!</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={restartConversation} className="text-white hover:bg-white/20">
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0">
            <ScrollArea className="flex-1 max-h-[calc(90vh-150px)] overflow-y-auto p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Welcome to Hobby Finder!</h3>
                    <p className="text-gray-500">
                      I'll help you discover new hobbies based on your interests and preferences. Let's start chatting!
                    </p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                  >
                    <Avatar
                      className={`${message.role === "user" ? "bg-blue-500" : "bg-gradient-to-r from-purple-500 to-pink-500"
                        }`}
                    >
                      <AvatarFallback className="bg-transparent text-white">
                        {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>

                    <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : "text-left"}`}>
                      <div
                        className={`inline-block p-3 rounded-2xl ${message.role === "user"
                          ? "bg-blue-500 text-white rounded-br-md"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm"
                          }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                      <div
                        className={`text-xs text-gray-400 mt-1 ${message.role === "user" ? "text-right" : "text-left"}`}
                      >
                        {formatTime(message.createdAt || new Date())}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="bg-gradient-to-r from-purple-500 to-pink-500">
                      <AvatarFallback className="bg-transparent text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-3 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <div className="p-4 border-t bg-gray-50">
            <form onSubmit={onSubmit} className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-full bg-blue-500 hover:bg-blue-600 px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Share your interests, and I'll suggest perfect hobbies for you!
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}



