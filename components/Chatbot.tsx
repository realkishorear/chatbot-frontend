'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send } from 'lucide-react'
import { Message } from '@/lib/types'
import MessageBubble from './MessegeBubble'

const modeOptions = ['In Person', 'Video Call']

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [formStep, setFormStep] = useState<0 | 1 | 2 | 3 | 4 | 5 | null>(null)
    const [isTyping, setIsTyping] = useState(false)

    const [branchOptions, setBranchOptions] = useState<string[]>([])
    const [treatmentOptions, setTreatmentOptions] = useState<string[]>([])
    const [doctorOptions, setDoctorOptions] = useState<string[]>([])
    const [availableTimes, setAvailableTimes] = useState<string[]>([])

    const [formData, setFormData] = useState<{
        phoneNumber?: string
        mode?: string
        branch?: string
        treatment?: string
        doctor?: string
        datetime?: string
    }>({})

    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const sendBotMessage = (content: string) => {
        setMessages(prev => [...prev, { role: 'bot', type: 'text', content, timestamp: now() }])
    }

    const sendUserMessage = (content: string) => {
        setMessages(prev => [...prev, { role: 'user', type: 'text', content, timestamp: now() }])
    }

    const completion_response = async (prompt: string) => {
        try {
            setIsTyping(true)
            const response = await fetch("http://127.0.0.1:8000/chat", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            })

            if (!response.ok) throw new Error("Failed to fetch queries!")
            const data = await response.json()
            return data
        } catch (error) {
            console.log("Error responding to the text : ", error)
            sendBotMessage("⚠️ Could not load response. Please try again later.")
            return null
        } finally {
            setTimeout(() => setIsTyping(false), 1000)
        }
    }

    const fetchBranches = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/branches')
            const data = await res.json()
            setBranchOptions(data)
        } catch {
            sendBotMessage('⚠️ Failed to load branches.')
        }
    }

    const fetchTreatments = async (branch: string) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/treatments?branch=${branch}`)
            const data = await res.json()
            setTreatmentOptions(data)
        } catch {
            sendBotMessage('⚠️ Failed to load treatments.')
        }
    }

    const fetchDoctors = async (treatment: string) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/doctors?treatment=${treatment}`)
            const data = await res.json()
            setDoctorOptions(data)
        } catch {
            sendBotMessage('⚠️ Failed to load doctors.')
        }
    }

    const fetchAvailableTimes = async (doctor: string) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/availability?doctor=${doctor}`)
            const data = await res.json()
            setAvailableTimes(data)
        } catch {
            sendBotMessage('⚠️ Failed to load available time slots.')
        }
    }

    const handleSend = async () => {
        if (!input.trim()) return
        const value = input.trim()
        sendUserMessage(value)
        setInput('')
        const assistant_response = await completion_response(value)

        if (assistant_response?.book_appointment) {
            setFormStep(0)
            sendBotMessage("📞 Please enter your phone number:")
        } else {
            sendBotMessage(`${assistant_response?.response || '🤖 No response.'}`)
        }
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    return (
        <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gray-100">
            <div className="w-full max-w-lg h-full sm:h-[90vh] flex flex-col rounded-2xl shadow-xl bg-white overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                    <ScrollArea className="h-full pr-2">
                        <div className="space-y-2">
                            {messages.map((msg, idx) => (
                                <MessageBubble key={idx} message={msg} />
                            ))}
                            {isTyping && (
                                <div className="text-sm text-gray-500 animate-pulse ml-2">
                                    🤖 Typing...
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>
                </div>

                <div className="border-t p-4 bg-white">
                    {formStep === 0 ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                const phone = formData.phoneNumber || ''
                                const valid = /^\+?\d{10,15}$/.test(phone)
                                if (!valid) return sendBotMessage("⚠️ Enter a valid phone number.")
                                sendUserMessage(phone)
                                setFormStep(1)
                                sendBotMessage("💻 Choose your mode of visit:")
                            }}
                            className="flex flex-col gap-2"
                        >
                            <Input
                                type="tel"
                                value={formData.phoneNumber || ''}
                                onChange={(e) =>
                                    setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))
                                }
                                placeholder="Enter your phone number"
                            />
                            <Button type="submit" className="w-full">Submit</Button>
                        </form>
                    ) : formStep === 1 ? (
                        <div className="flex flex-col gap-2">
                            <select
                                className="border p-2 rounded"
                                onChange={(e) => setFormData(prev => ({ ...prev, mode: e.target.value }))}
                                defaultValue=""
                            >
                                <option value="" disabled>Select mode of visit</option>
                                {modeOptions.map(mode => (
                                    <option key={mode} value={mode}>{mode}</option>
                                ))}
                            </select>
                            <Button
                                onClick={() => {
                                    if (!formData.mode) return
                                    sendUserMessage(formData.mode)
                                    fetchBranches()
                                    setFormStep(2)
                                    sendBotMessage("🏢 Please select a branch:")
                                }}
                                className="w-full"
                            >
                                Submit
                            </Button>
                        </div>
                    ) : formStep === 2 ? (
                        <div className="flex flex-col gap-2">
                            <select
                                className="border p-2 rounded"
                                onChange={(e) =>
                                    setFormData(prev => ({ ...prev, branch: e.target.value }))
                                }
                                defaultValue=""
                            >
                                <option value="" disabled>Select branch</option>
                                {branchOptions.map(branch => (
                                    <option key={branch} value={branch}>{branch}</option>
                                ))}
                            </select>
                            <Button
                                onClick={() => {
                                    if (!formData.branch) return
                                    sendUserMessage(formData.branch)
                                    fetchTreatments(formData.branch)
                                    setFormStep(3)
                                    sendBotMessage("💊 Please select a treatment:")
                                }}
                                className="w-full"
                            >
                                Submit
                            </Button>
                        </div>
                    ) : formStep === 3 ? (
                        <div className="flex flex-col gap-2">
                            <select
                                className="border p-2 rounded"
                                onChange={(e) =>
                                    setFormData(prev => ({ ...prev, treatment: e.target.value }))
                                }
                                defaultValue=""
                            >
                                <option value="" disabled>Select treatment</option>
                                {treatmentOptions.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <Button
                                onClick={() => {
                                    if (!formData.treatment) return
                                    sendUserMessage(formData.treatment)
                                    fetchDoctors(formData.treatment)
                                    setFormStep(4)
                                    sendBotMessage("👨‍⚕️ Please select a doctor:")
                                }}
                                className="w-full"
                            >
                                Submit
                            </Button>
                        </div>
                    ) : formStep === 4 ? (
                        <div className="flex flex-col gap-2">
                            <select
                                className="border p-2 rounded"
                                onChange={(e) =>
                                    setFormData(prev => ({ ...prev, doctor: e.target.value }))
                                }
                                defaultValue=""
                            >
                                <option value="" disabled>Select doctor</option>
                                {doctorOptions.map(doc => (
                                    <option key={doc} value={doc}>{doc}</option>
                                ))}
                            </select>
                            <Button
                                onClick={() => {
                                    if (!formData.doctor) return
                                    sendUserMessage(formData.doctor)
                                    fetchAvailableTimes(formData.doctor)
                                    setFormStep(5)
                                    sendBotMessage("📅 Please select a date & time:")
                                }}
                                className="w-full"
                            >
                                Submit
                            </Button>
                        </div>
                    ) : formStep === 5 ? (
                        <div className="flex flex-col gap-2">
                            <select
                                className="border p-2 rounded"
                                onChange={(e) =>
                                    setFormData(prev => ({ ...prev, datetime: e.target.value }))
                                }
                                defaultValue=""
                            >
                                <option value="" disabled>Select date & time</option>
                                {availableTimes.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                            <Button
                                onClick={() => {
                                    if (!formData.datetime) return
                                    sendUserMessage(formData.datetime)
                                    sendBotMessage(
                                        `✅ Booking confirmed!\n\n` +
                                        `📞 Phone: ${formData.phoneNumber}\n` +
                                        `💻 Mode: ${formData.mode}\n` +
                                        `🏢 Branch: ${formData.branch}\n` +
                                        `💊 Treatment: ${formData.treatment}\n` +
                                        `👨‍⚕️ Doctor: ${formData.doctor}\n` +
                                        `📅 Time: ${formData.datetime}`
                                    )
                                    setFormData({})
                                    setFormStep(null)
                                }}
                                className="w-full"
                            >
                                Confirm
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleSend()
                                    }
                                }}
                                className="flex-1"
                                placeholder="Type your message"
                            />
                            <Button
                                onClick={handleSend}
                                className="gap-1 px-3 w-full sm:w-auto mt-2 sm:mt-0"
                            >
                                <Send className="h-4 w-4" />
                                Send
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
