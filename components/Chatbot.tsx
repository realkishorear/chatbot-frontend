'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send } from 'lucide-react'
import { Message } from '@/lib/types'
import MessageBubble from './MessegeBubble'

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [formStep, setFormStep] = useState<0 | 1 | 2 | 3 | 4 | any>(null)
    const [isTyping, setIsTyping] = useState(false)

    const [branchOptions, setBranchOptions] = useState<any[]>([])
    const [treatmentOptions, setTreatmentOptions] = useState<any[]>([])
    const [doctorOptions, setDoctorOptions] = useState<any[]>([])
    const [availableTimes, setAvailableTimes] = useState<{ date: string; time: string } | null>(null)

    const [formData, setFormData] = useState({
        branch_id: '',
        treatment_id: '',
        doctor_id: '',
        datetime: '',
        name: '',
        gender: '',
        phoneNumber: '',
        modeOfVisit: '', // ✅ NEW FIELD
    })

    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const sendBotMessage = (content: string) => {
        setMessages(prev => [...prev, { role: 'bot', type: 'text', content, timestamp: now() }])
    }

    const sendBotMessageWithDelay = async (content: string, delay = 1500) => {
        setIsTyping(true)
        await new Promise(res => setTimeout(res, delay))
        sendBotMessage(content)
        setIsTyping(false)
    }

    const sendUserMessage = (content: string) => {
        setMessages(prev => [...prev, { role: 'user', type: 'text', content, timestamp: now() }])
    }

    const handleSend = async () => {
        if (!input.trim()) return
        const value = input.trim()
        sendUserMessage(value)
        setInput('')
        setIsTyping(true)

        try {
            const res = await fetch("http://127.0.0.1:8000/chat", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: value })
            })

            const data = await res.json()

            if (data.book_appointment) {
                setFormStep(0)
                await fetchBranches()
            } else {
                await sendBotMessageWithDelay(data.response || "🤖 No response.")
            }
        } catch {
            await sendBotMessageWithDelay("⚠️ Could not load response.")
        } finally {
            setIsTyping(false)
            inputRef.current?.focus()
        }
    }

    const fetchBranches = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/branches/1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    'ApplicationType': 0,
                    'HospitalID': 1
                })
            })
            const data = await res.json()
            setBranchOptions(data.branch)
            await sendBotMessageWithDelay("🏢 Please select a branch:")
        } catch {
            await sendBotMessageWithDelay("⚠️ Failed to load branches.")
        }
    }

    const fetchTreatments = async (branch_id: string) => {
        try {
            const data = {
                treatment: [
                    { id: "1", treatment_name: "General Checkup" },
                    { id: "2", treatment_name: "Dental Cleaning" }
                ]
            }
            setTreatmentOptions(data.treatment)
            await sendBotMessageWithDelay("💊 Please select a treatment:")
        } catch {
            await sendBotMessageWithDelay("⚠️ Failed to load treatments.")
        }
    }

    const fetchDoctors = async (branch_id: string, treatment_id: string) => {
        try {
            const data = {
                doctors: [
                    { id: "1", doctor_name: "Dr. Smith" },
                    { id: "2", doctor_name: "Dr. Johnson" }
                ]
            }
            setDoctorOptions(data.doctors)
            await sendBotMessageWithDelay("👨‍⚕️ Please select a doctor:")
        } catch {
            await sendBotMessageWithDelay("⚠️ Failed to load doctors.")
        }
    }

    const fetchAvailableTimes = async (branch_id: string, treatment_id: string, doctor_id: string) => {
        try {
            const data = { date: "2025-05-15", time: "10:00" }
            setAvailableTimes(data)
            await sendBotMessageWithDelay("📅 Please confirm your date & time.")
        } catch {
            await sendBotMessageWithDelay("⚠️ Failed to load available times.")
        }
    }

    const submitFinalForm = async () => {
        try {
            await fetch('http://127.0.0.1:8000/confirm-appointment/1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            await sendBotMessageWithDelay("✅ Your appointment is confirmed! Thank you.")
        } catch {
            await sendBotMessageWithDelay("⚠️ Could not complete appointment booking.")
        }
    }

    useEffect(() => {
        sendBotMessageWithDelay("Hey, this is Ria. How may I help you?", 1500)
        inputRef.current?.focus()
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    const renderSelectStep = (
        label: string,
        options: any[],
        valueKey: string,
        labelKey: string,
        field: keyof typeof formData,
        nextStep: number | null,
        onNext?: () => void
    ) => (
        <div className="flex flex-col gap-2">
            <select
                className="border p-2 rounded"
                value={formData[field]}
                onChange={(e) =>
                    setFormData(prev => ({ ...prev, [field]: e.target.value }))
                }
            >
                <option value="" disabled>{label}</option>
                {options.map(opt => (
                    <option key={opt[valueKey]} value={opt[valueKey]}>
                        {opt[labelKey] || opt[valueKey]}
                    </option>
                ))}
            </select>
            <Button
                onClick={async () => {
                    const val = formData[field]
                    if (!val) return

                    const selectedOption = options.find(o => o[valueKey] == val)
                    const selectedLabel = selectedOption?.[labelKey] || selectedOption?.[valueKey] || val

                    sendUserMessage(selectedLabel)

                    if (onNext) await onNext()
                    setFormStep(nextStep)
                }}
            >
                Submit
            </Button>
        </div>
    )

    return (
        <div className="w-screen h-screen bg-gray-100 flex items-center justify-center p-2">
            <div className="w-full max-w-md h-full sm:h-[90vh] flex flex-col bg-white rounded-2xl shadow-md overflow-hidden">
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
                    {formStep === 0 && renderSelectStep(
                        "Select branch", branchOptions, "id", "branch_name", "branch_id", 1,
                        () => fetchTreatments(formData.branch_id)
                    )}

                    {formStep === 1 && renderSelectStep(
                        "Select treatment", treatmentOptions, "id", "treatment_name", "treatment_id", 2,
                        () => fetchDoctors(formData.branch_id, formData.treatment_id)
                    )}

                    {formStep === 2 && renderSelectStep(
                        "Select doctor", doctorOptions, "id", "doctor_name", "doctor_id", 3,
                        () => fetchAvailableTimes(formData.branch_id, formData.treatment_id, formData.doctor_id)
                    )}

                    {formStep === 3 && availableTimes && (
                        <div className="flex flex-col gap-2">
                            <Input
                                type="datetime-local"
                                value={formData.datetime}
                                min={`${availableTimes.date}T${availableTimes.time}`}
                                onChange={e =>
                                    setFormData(prev => ({ ...prev, datetime: e.target.value }))
                                }
                            />
                            <Button
                                onClick={() => {
                                    if (!formData.datetime) return
                                    sendUserMessage(formData.datetime)
                                    setFormStep(4)
                                    sendBotMessage("🙋 Please enter your name, gender, phone number, and mode of visit:")
                                }}
                            >
                                Submit
                            </Button>
                        </div>
                    )}

                    {formStep === 4 && (
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault()
                                const { name, gender, phoneNumber, modeOfVisit } = formData
                                const validPhone = /^\+?\d{10,15}$/.test(phoneNumber)

                                if (!name || !gender || !validPhone || !modeOfVisit) {
                                    await sendBotMessageWithDelay("⚠️ Please provide valid name, gender, phone number, and mode of visit.")
                                    return
                                }

                                sendUserMessage(`Name: ${name}, Gender: ${gender}, Phone: ${phoneNumber}, Mode: ${modeOfVisit}`)
                                setFormStep(null)
                                await submitFinalForm()
                            }}
                            className="flex flex-col gap-2"
                        >
                            <Input
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                            <select
                                className="border p-2 rounded"
                                value={formData.gender}
                                onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                required
                            >
                                <option value="" disabled>Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            <Input
                                type="tel"
                                placeholder="Phone Number"
                                value={formData.phoneNumber}
                                onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                required
                            />
                            <select
                                className="border p-2 rounded"
                                value={formData.modeOfVisit}
                                onChange={e => setFormData(prev => ({ ...prev, modeOfVisit: e.target.value }))}
                                required
                            >
                                <option value="" disabled>Select Mode of Visit</option>
                                <option value="In-Person">In-Person</option>
                                <option value="Online">Online</option>
                            </select>
                            <Button type="submit">Submit</Button>
                        </form>
                    )}

                    {formStep == null && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <Input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        await handleSend()
                                    }
                                }}
                                className="flex-1"
                                placeholder="Type your message"
                                autoComplete="off"
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