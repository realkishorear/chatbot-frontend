'use client'

import { useEffect, useRef, useState, useLayoutEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Hospital, Send } from 'lucide-react'
import { Message } from '@/lib/types'
import MessageBubble from './MessegeBubble'
import Spinner from '@/components/ui/spinner'
import { Value } from '@radix-ui/react-select'
import Roller from './ui/roller'

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [formStep, setFormStep] = useState<number>(-1)
    const [isTyping, setIsTyping] = useState(false)
    const [loadingOtp, setLoadingOtp] = useState(false)

    const [organizationId, setOrganizationId] = useState<string | null>(null)
    const [SessionId, setSessionId] = useState('')

    const generateSessionId = () => {
        return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`
      }      

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const orgId = params.get('org_id') || 'defaultOrg';
        setOrganizationId(orgId)
        localStorage.setItem('count', '0')
        const sessionId = generateSessionId()
        setSessionId(sessionId)
    }, [])


    useEffect(() => {
        const rawValue = localStorage.getItem('count');
        const currentCount = parseInt(rawValue || '0', 10);
    
        if (currentCount >= 20) {
            setMessages([])
            sendBotMessage("You seem more interested in our hospital. For more details contact our customer care.");
            return
        }
    
        const newCount = currentCount + 1;
        localStorage.setItem('count', newCount.toString());
    
        if (mainInputRef.current !== null) {
            mainInputRef.current.focus();
        }
    }, [messages]);
    
    

    const [selectedDate, setSelectedDate] = useState('')
    const [timeSlots, setTimeSlots] = useState<{ time_id: any; Time: any, StatusId: number }[]>([])
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('')

    const [branchOptions, setBranchOptions] = useState<any[]>([])
    const [treatmentOptions, setTreatmentOptions] = useState<any[]>([])
    const [doctorOptions, setDoctorOptions] = useState<any[]>([])
    const [availableTimes, setAvailableTimes] = useState<{ date: string; time: string } | null>(null)

    const [loadingBranches, setLoadingBranches] = useState(false)
    const [loadingTreatments, setLoadingTreatments] = useState(false)
    const [loadingDoctors, setLoadingDoctors] = useState(false)
    const [loadingTimes, setLoadingTimes] = useState(false)

    const [formData, setFormData] = useState({
        branch_id: '',
        treatment_id: '',
        treatment_name: '',
        doctor_id: '',
        datetime: '',
        name: '',
        gender: '',
        phoneNumber: '',
        modeOfVisit: '',
        timeSlotId: '',
        patientId: ''
    })

    const [Token, setToken] = useState<number>(0)

    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [otp, setOtp] = useState('')

    const messagesEndRef = useRef<HTMLDivElement | any>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)
    const phoneInputRef = useRef<HTMLInputElement>(null)
    const mainInputRef = useRef<HTMLInputElement | any>(null)
    const otpInputRef = useRef<HTMLInputElement>(null)
    const dateInputRef = useRef<HTMLInputElement>(null)
    const nameInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        requestAnimationFrame(() => {
            if (formStep === null && mainInputRef.current) mainInputRef.current.focus();
            else if (formStep === 0 && phoneInputRef.current) phoneInputRef.current.focus();
            else if (formStep === 1 && otpInputRef.current) otpInputRef.current.focus();
            else if (formStep === 5 && dateInputRef.current) dateInputRef.current.focus();
            else if (formStep === 6 && nameInputRef.current) nameInputRef.current.focus();
        });
    }, [formStep]);


    const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const sendBotMessage = (content: string) => {
        setMessages(prev => [...prev, { role: 'bot', type: 'text', content, timestamp: now() }])
        scrollToBottom()
    }

    const sendBotMessageWithDelay = async (content: string, delay = 0) => {
        setIsTyping(true)
        await new Promise(res => setTimeout(res, delay))
        sendBotMessage(content)
        setIsTyping(false)
        scrollToBottom()
    }

    const sendUserMessage = (content: string) => {
        setMessages(prev => [...prev, { role: 'user', type: 'text', content, timestamp: now() }])
    }

    const fetchBranches = async () => {
        try {
            console.log("Fetching branches...")
            setLoadingBranches(true)
            setIsTyping(true)
            const res = await fetch(`http://localhost:8000/branches/${organizationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    ApplicationType: 0,
                    HospitalID: 1,
                }),
            })
            const data = await res.json()
            console.log(data)

            setBranchOptions(data.branch)
            await sendBotMessageWithDelay('Which branch of hospital you want to visit?')
            scrollToBottom()


        } catch {
            await sendBotMessageWithDelay('⚠️ Failed to load branches.')
            scrollToBottom()

        } finally {
            setLoadingBranches(false)
            setIsTyping(false)
            scrollToBottom()
            // Reduce the counter
        }
    }

    const fetchTreatments = async (branch_id: string, token: string) => {
        try {
            setIsTyping(true)
            setLoadingTreatments(true)
            const res = await fetch(`http://localhost:8000/api/treatments/${organizationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    AppointmentTypeID: 1,
                    HospitalId: parseInt(branch_id),
                }),
            })
            const data = await res.json()

            if (data.isTreatments)
                await sendBotMessageWithDelay("Treatments doesn't exists!")

            else {
                setTreatmentOptions(data.treatment)
                await sendBotMessageWithDelay('What kind of treatment you want to take?')
            }

            scrollToBottom()


        } catch {
            await sendBotMessageWithDelay('⚠️ Failed to load treatments.')

        } finally {
            setLoadingTreatments(false)
            setIsTyping(false)
        }
    }

    const fetchDoctors = async (branch_id: string, treatment_id: string, token: string) => {
        try {
            setLoadingDoctors(true)
            setIsTyping(true)
            const res = await fetch(`http://localhost:8000/api/doctors/${organizationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    AppointmentTypeID: 0,
                    HospitalId: branch_id,
                    TreatmentID: treatment_id,
                }),
            })
            const data = await res.json()

            if (data.isDoctors)
                await sendBotMessageWithDelay("Doctors doesn't exists!")

            else {
                setDoctorOptions(data.doctors)
                await sendBotMessageWithDelay('Which doctor do you want to consult?')
            }

            scrollToBottom()


        } catch {
            await sendBotMessageWithDelay('⚠️ Network error : Failed to load doctors.')

        } finally {
            setLoadingDoctors(false)
            setIsTyping(false)
            scrollToBottom()
        }
    }

    const submitFinalForm = async () => {
        try {
            setIsTyping(true)
            const requestBody = {
                HospitalDetailsID: formData.branch_id,
                OrderStartTime: formData.timeSlotId,
                BookingDate: formData.datetime,
                PhoneNumber: formData.phoneNumber,
                HospitalEmployeeDetailsID: formData.doctor_id,
                HospitalTreatmentID: formData.treatment_id,
                TreatmentName: formData.treatment_name,
                UserDetailsID: formData.patientId
            }
            console.log(requestBody)
            const response = await fetch(`http://localhost:8000/api/appointment/${organizationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(requestBody),
            })
            const data = await response.json()
            if (data['Status'])
                await sendBotMessageWithDelay('Your appointment is confirmed! Thank you.')

            else
                await sendBotMessageWithDelay('Your appointment has been rejected!')
            scrollToBottom()

        } catch {
            await sendBotMessageWithDelay('⚠️ Network error : Check your internet connection!')

        } finally {
            setIsTyping(false)
        }
    }

    // --- New handleSend logic ---

    const handleSend = async () => {
        if (!input.trim()) return
        const value = input.trim()
        sendUserMessage(value)
        setInput('')
        setIsTyping(true)

        try {
            const res = await fetch('http://192.168.228.96:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: value,
                    session_id : SessionId,
                    organization_id : organizationId
                }),
            })

            // if(!res.ok || !res.body)
            //     throw new Error("Failed to fetch response!")
            const data = await res.json()
            console.log(data)
            setToken(prev => prev + 1)
            if (data.book_appointment) {
                sendBotMessage('Can i get your Phone Number for verification')
                setFormStep(0) // start with phone number input
            } else {
                await sendBotMessageWithDelay(data.response || '🤖 No response.')
            }
        } catch {
            await sendBotMessageWithDelay('⚠️ Error connecting to server!')
        } finally {
            setIsTyping(false)
            inputRef.current?.focus()
        }
    }

    const scrollToBottom = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth',
                });
            });
        });
    };

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const atBottom =
                container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
            setIsAutoScrollEnabled(atBottom);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, []);


    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const observer = new MutationObserver(() => {
            if (isAutoScrollEnabled) scrollToBottom();
        });

        observer.observe(container, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, [isAutoScrollEnabled]);

    useEffect(() => {
        sendBotMessageWithDelay('Hey, this is Ria. How may I help you?', 1000)
        setFormStep(-1)
        inputRef.current?.focus()
    }, [])


    const renderSelectStep = (
        label: string,
        options: any[],
        valueKey: string,
        labelKey: string,
        field: keyof typeof formData,
        nextStep: number,
        onNext?: () => void,
    ) => (
        <form
            className="flex flex-col gap-2"
            onSubmit={async e => {
                e.preventDefault()
                const val = formData[field]
                if (!val) return

                const selectedOption = options.find(o => o[valueKey] == val)
                const selectedLabel = selectedOption?.[labelKey] || selectedOption?.[valueKey] || val

                sendUserMessage(selectedLabel)
                scrollToBottom()
                if (onNext) await onNext()
                setFormStep(nextStep)
            }}
        >
            <select
                className="border p-2 rounded"
                value={formData[field] || ''}
                onChange={e => {
                    const selectedId = e.target.value;
                    const selectedOption = options.find(o => o[valueKey] == selectedId);

                    setFormData(prev => {
                        const updated = { ...prev, [field]: selectedId };
                        // Special case for treatment: save treatment_name too
                        if (field === 'treatment_id' && selectedOption) {
                            updated.treatment_name = selectedOption[labelKey];
                        }
                        return updated;
                    });
                }}
                required
                disabled={isTyping}
            >
                <option value="" disabled>
                    {label}
                </option>
                {options.map(opt => (
                    <option key={opt[valueKey]} value={opt[valueKey]}>
                        {opt[labelKey] || opt[valueKey]}
                    </option>
                ))}
            </select>

            <Button type="submit" disabled={isTyping}>Submit</Button>
        </form>
    )

    useEffect(() => {
        const sampleToken = sessionStorage.getItem('token')
        if (sampleToken)
            setAccessToken(sampleToken)
    }, [])

    const [NewData, setNewData] = useState({
        FullName: '',
        EmailID: '',
        MobileNumber: formData.phoneNumber,
        Gender: '',
        DateOfBirth: '',
    })

    const [Patient, setPatient] = useState<any[]>([])
    const fetchPaitent = async () => {
        try {

            const res = await fetch(`http://localhost:8000/api/getFamilyMembers/${organizationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    number: formData.phoneNumber
                })
            })

            const data = await res.json()
            console.log(data)

            if (data['Status']) {
                setPatient(data['FamilyMembers'])
                sendBotMessageWithDelay("Who is sick in your family or it's you ?")
            }
            else
                await sendBotMessageWithDelay("Unable to fetch Patient data")

        } catch (error) {
            sendBotMessage("Network issues!")
        }
    }

    const [FamMember, setFamMember] = useState({
        FullName: '',
        Gender: '',
        phoneNumber: ''
    })
    const createFamMemeber = async () => {
        if (!(FamMember.FullName || FamMember.Gender || FamMember.phoneNumber)) {
            await sendBotMessageWithDelay("Enter all the required details!")
            return
        }
        sendUserMessage(`I'm name ${FamMember.FullName}, i identify as ${FamMember.Gender == '1' ? 'Male' : FamMember.Gender == '2' ? 'Female' : 'Non binary'} and ${FamMember.phoneNumber} is my contact number`)
        try {
            setIsTyping(true)
            const res = await fetch(`http://localhost:8000/api/addFamilyMember/${organizationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    data: [{
                        FullName: FamMember.FullName,
                        number: FamMember.phoneNumber,
                        Gender: FamMember.Gender,
                        GovermentProof: []
                    }]

                })
            })

            const data = await res.json()
            if (data['Status']) {
                await sendBotMessageWithDelay("Welcome to the Family. You've been added!")
                setFormData(prev => ({ ...prev, patientId: data['UserDetailsID'] }))
                await fetchBranches()
                setFormStep(4)
            } else {
                await sendBotMessageWithDelay("I wasn't able to create a Family member. Can you please try again!")
                setFormStep(5)
                setFamMember({
                    FullName: '',
                    Gender: '',
                    phoneNumber: formData.phoneNumber,

                })
            }

        } catch (error) {
            await sendBotMessageWithDelay("Network Error!")
        } finally {
            setIsTyping(false)
        }
    }

    const [NewUserFlow, setNewUserFlow] = useState(false)

    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <div className="w-full max-w-md h-full sm:h-[90vh] flex flex-col rounded-2xl shadow-md">

                <div className='bg-black/90 px-4 py-3 gap-4 text-white flex justify-start items-center shadow-2xl'>
                    <img src="/nurse.png" className="h-12 w-12 rounded-full" alt="ria" />
                    <p className='text-xl sm:text-2xl font-bold text-blue-400'>Ria <span className='text-sm sm:text-lg text-white shadow-2xl'>Your medical assistant</span></p>
                </div>
                <div
                    className="flex-1 h-0 overflow-hidden flex flex-col bg-[url('/chatbot_bg.jpeg')] bg-cover bg-center"
                >
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 p-6 overflow-y-auto overflow-x-hidden bg-opacity-80"
                    >
                        {messages.map((msg, idx) => (
                            <MessageBubble key={idx} message={msg} />
                        ))}

                        {isTyping && (
                            <div className="min-h-[32px] flex items-center gap-2 text-white italic">
                                <Spinner />
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>


                <div className="p-4 border-t">
                    {/* Step -1 : Chatting with LLM*/}
                    {formStep === -1 && (
                        <form
                            onSubmit={e => {
                                e.preventDefault()
                                handleSend()
                            }}
                            className="flex gap-2 w-full items-center"
                        >
                            <div className="relative w-full h-full">
                                <textarea
                                    ref={mainInputRef}
                                    value={input}
                                    onChange={e => {
                                        if (e.target.value.length <= 140) {
                                            setInput(e.target.value);
                                        }
                                    }}
                                    placeholder="Talk with our Assistant"
                                    disabled={isTyping}
                                    rows={2}
                                    autoFocus
                                    className="w-full resize-none overflow-auto p-2 border rounded-md focus:outline-none"
                                />
                                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                    {input.length} / 140 characters
                                </div>
                            </div>

                           <div className=''>
                            <Button type="submit" disabled={isTyping || !input.trim()} className='flex-1'>
                                    <Send />
                                </Button>
                           </div>
                        </form>
                    )}

                    {/* Step 0: Phone Number Input */}
                    {formStep === 0 && (
                        <form
                            onSubmit={async e => {
                                e.preventDefault()
                                const phone = formData.phoneNumber.trim()
                                const validPhone = /^\+?\d{10}$/.test(phone)
                                if (!validPhone) {
                                    await sendBotMessageWithDelay('⚠️ Please enter a valid phone number.')
                                    return
                                }
                                sendUserMessage(phone)
                                setNewData(prev => ({ ...prev, MobileNumber: phone }))
                                setFamMember(prev => ({ ...prev, phoneNumber: phone }))
                                setLoadingOtp(true)
                                try {
                                    setIsTyping(true)
                                    const res = await fetch(`http://localhost:8000/api/generateotp/${organizationId}`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            number: phone
                                        }),
                                    })
                                    const data = await res.json()
                                    if (data['Status']) {
                                        await sendBotMessageWithDelay("I have sent an OTP to your mobile. Can you please verify it!")
                                        setFormStep(1) // Move to OTP input 
                                    } else {
                                        await sendBotMessageWithDelay("You don't have an account. Im signing you up for this.")
                                        setFormStep(2) // Create a new user
                                    }
                                } catch {
                                    await sendBotMessageWithDelay('⚠️ Network error while sending OTP.')

                                } finally {
                                    setLoadingOtp(false)
                                    setIsTyping(false)
                                }
                            }}
                            className="flex flex-col gap-2"
                        >
                            <Input
                                type="tel"
                                placeholder="Enter your mobile number"
                                value={formData.phoneNumber}
                                ref={phoneInputRef}
                                onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                required
                                disabled={loadingOtp}
                            />
                            <Button type="submit" disabled={loadingOtp}>
                                {loadingOtp ? <Roller /> : 'Send OTP'}
                            </Button>
                        </form>
                    )}

                    {/* Step 1.1 : OTP Input */}
                    {formStep === 1 && (
                        <form
                            onSubmit={async e => {
                                e.preventDefault()
                                if (!otp.trim()) return
                                sendUserMessage(`OTP: ${otp.trim()}`)
                                try {
                                    setIsTyping(true)
                                    const res = await fetch(`http://localhost:8000/api/verifyotp/${organizationId}`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            number: formData.phoneNumber,
                                            otp: otp.trim(),
                                        }),
                                    })
                                    const data = await res.json()
                                    console.log(data)
                                    if (data['Status'] && data['Access_token']) {
                                        sessionStorage.setItem('token', data.Access_token)
                                        setAccessToken(data.Access_token)
                                        await sendBotMessageWithDelay('Your OTP has been verified!')
                                        if (NewUserFlow) {
                                            await fetchBranches()
                                            setFormStep(4) //Fetch branches
                                        }
                                        else {
                                            await fetchPaitent()
                                            setFormStep(3) //Select patients
                                        }
                                    } else {
                                        await sendBotMessageWithDelay('⚠️ OTP verification failed. Please try again!')
                                        setFormStep(0) //Input phone number
                                    }
                                } catch {
                                    await sendBotMessageWithDelay('⚠️ Network error while verifying OTP.')
                                } finally {
                                    setIsTyping(false)
                                }
                            }}
                            className="flex flex-col gap-2"
                        >
                            <Input
                                type="text"
                                placeholder="Enter OTP"
                                ref={otpInputRef}
                                value={otp}
                                onChange={e => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                                    setOtp(value)
                                }}
                                required
                                disabled={isTyping}
                            />

                            <Button type="submit" disabled={isTyping}>Verify OTP</Button>
                        </form>
                    )}

                    {/* Step 1.2 : Create a new user */}
                    {formStep === 2 && (
                        <form
                            onSubmit={async e => {
                                e.preventDefault()
                                console.log(NewData)
                                if (!(NewData.DateOfBirth && NewData.EmailID && NewData.FullName && NewData.MobileNumber && NewData.Gender)) {
                                    sendBotMessage("Please enter all the required details to register!")
                                    return
                                }
                                sendUserMessage(`I'm ${NewData.FullName}, my contact number is ${NewData.MobileNumber} and mail Id is ${NewData.EmailID}`)
                                sendBotMessage("I am signing you up!")

                                try {
                                    setIsTyping(true)
                                    const res = await fetch(`http://localhost:8000/api/Register/${organizationId}`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            FullName: NewData.FullName,
                                            EmailID: NewData.EmailID,
                                            MobileNumber: NewData.MobileNumber,
                                            PhoneNumber: NewData.MobileNumber,
                                            Gender: NewData.Gender,
                                            DateOfBirth: NewData.DateOfBirth,
                                            UserName: NewData.MobileNumber
                                        }),
                                    })
                                    const data = await res.json()
                                    console.log(data)
                                    if (data['Status']) {
                                        setFormStep(1)
                                        setFormData(prev => ({ ...prev, phoneNumber: NewData.MobileNumber, patientId: data['UserDetailsId'] }))
                                        setNewUserFlow(true)
                                        await sendBotMessageWithDelay("I have sent an OTP to your mobile number. Please verify it!")
                                    } else {
                                        setFormStep(2)
                                        await sendBotMessageWithDelay(`I got an error while signing you up. Can you please try again!`)
                                    }

                                } catch (error) {
                                    await sendBotMessageWithDelay('⚠️ Network error while creating a new user')
                                } finally {
                                    setIsTyping(false)
                                }

                            }}
                            className='flex flex-col gap-2'
                        >
                            <Input
                                type='text'
                                placeholder='Enter your Full Name'
                                value={NewData.FullName}
                                onChange={e => {
                                    const value = e.target.value
                                    setNewData(prev => ({ ...prev, FullName: value }))
                                }}
                                disabled={isTyping}
                                required
                            />

                            <Input
                                type='email'
                                placeholder='Enter your email address'
                                value={NewData.EmailID}
                                onChange={e => {
                                    const value = e.target.value
                                    setNewData(prev => ({ ...prev, EmailID: value }))
                                }}
                                disabled={isTyping}
                                required
                            />

                            <div>
                                <Input
                                    type="date"
                                    className="flex rounded border p-2"
                                    value={NewData.DateOfBirth}
                                    onChange={e => {
                                        const value = e.target.value
                                        setNewData(prev => ({ ...prev, DateOfBirth: value }))
                                    }}
                                    disabled={isTyping}
                                    required
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>



                            <select
                                className="border p-2 rounded"
                                value={NewData.Gender}
                                onChange={e => setNewData(prev => ({ ...prev, Gender: e.target.value }))}
                                required
                                disabled={isTyping}
                            >
                                <option value="" disabled>
                                    Select your gender
                                </option>
                                <option value="1">
                                    Male
                                </option>
                                <option value="2">
                                    Female
                                </option>
                                <option value="3">
                                    Others
                                </option>
                            </select>

                            <Button type='submit' disabled={isTyping}>
                                Sign Up
                            </Button>
                        </form>
                    )}

                    {/* Step 2 : Patient selection */}
                    {formStep === 3 && (
                        <form
                            onSubmit={async e => {
                                e.preventDefault()
                                if (!formData.patientId.trim()) {
                                    await sendBotMessageWithDelay("Select a family member to book an appointment!")
                                    return
                                }
                                const p = Patient.findIndex((temp) => temp.UserDetailsID == formData.patientId)
                                console.log(p)
                                sendUserMessage(Patient[p].UserName)
                                await fetchBranches()
                                setFormStep(4)
                            }}
                            className='flex flex-col gap-2'
                        >
                            <select
                                className="border p-2 rounded"
                                value={formData.patientId}
                                onChange={e => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                                required
                                disabled={isTyping}
                            >
                                <option value="" disabled>
                                    Select a family Member
                                </option>
                                {Patient.map(slot => (
                                    <option key={slot.UserDetailsID} value={slot.UserDetailsID}>
                                        {slot.UserName}
                                    </option>
                                ))}
                            </select>
                            <Button
                                onClick={() => { setFormStep(5) }}
                                className='bg-slate-900'
                                disabled={isTyping}
                            >
                                Add New Family Member
                            </Button>
                            <Button type='submit' disabled={isTyping}>
                                Select Branch
                            </Button>
                        </form>
                    )}

                    {/* Step 3.1: Branch selection */}
                    {formStep === 4 &&
                        ((renderSelectStep(
                            'Select a branch',
                            branchOptions,
                            'branch_id',
                            'branch_name',
                            'branch_id',
                            6,
                            async () => {
                                await fetchTreatments(formData.branch_id, accessToken!)
                            },
                        )))}

                    {/* Step 3.2 : Adding new family member*/}
                    {formStep === 5 && (
                        <form
                            className='flex flex-col gap-2'
                            onSubmit={async e => {
                                e.preventDefault()
                                await createFamMemeber()
                            }}
                        >
                            <Input
                                type='text'
                                placeholder='Enter your Full Name'
                                value={FamMember.FullName}
                                onChange={e => {
                                    const VALUE = e.target.value
                                    setFamMember(prev => ({ ...prev, FullName: VALUE }))
                                }}
                                disabled={isTyping}
                                required
                            />

                            <select
                                className='border p-2 rounded'
                                value={FamMember.Gender}
                                onChange={e => {
                                    const GENDER = e.target.value
                                    setFamMember(prev => ({ ...prev, Gender: GENDER }))
                                }}
                                disabled={isTyping}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="1">Male</option>
                                <option value="2">Female</option>
                                <option value="3">Others</option>
                            </select>

                            <Button type='submit'>
                                Create Member
                            </Button>
                        </form>
                    )}

                    {/* Step 4: Treatment selection */}
                    {formStep === 6 && (
                        (renderSelectStep(
                            'Select a treatment',
                            treatmentOptions,
                            'treatment_id',
                            'treatment_name',
                            'treatment_id',
                            7,
                            async () => {
                                await fetchDoctors(formData.branch_id, formData.treatment_id, accessToken!)
                            },
                        )))}

                    {/* Step 5: Doctor selection */}
                    {formStep === 7 && (
                        doctorOptions.length == 0 ? (
                            (() => {
                                sendBotMessage("No doctors available for the choosen treatments! Can you please select a different doctor.");
                                setFormStep(prev => prev - 1)
                                return null
                            })()) :
                            (renderSelectStep(
                                'Select a doctor',
                                doctorOptions,
                                'doctor_id',
                                'doctor_name',
                                'doctor_id',
                                8,
                                () => { sendBotMessage("Select your date of availability") }
                            ))
                    )}

                    {/* Step 6: Date confirmation */}
                    {formStep === 8 && (
                        <form
                            className="flex flex-col gap-2"
                            onSubmit={async e => {
                                setIsTyping(true)
                                e.preventDefault()
                                if (!selectedDate) {
                                    await sendBotMessageWithDelay('⚠️ Please select a valid date.')
                                    return
                                }
                                sendUserMessage(selectedDate)
                                setFormData(prev => ({ ...prev, datetime: selectedDate }))

                                try {
                                    const res = await fetch(`http://localhost:8000/api/availability/${organizationId}`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: `Bearer ${accessToken}`,
                                        },
                                        body: JSON.stringify({
                                            HospitalId: formData.branch_id,
                                            // treatment_id: formData.treatment_id,
                                            HospitalEmployeeDetailsID: formData.doctor_id,
                                            Date: selectedDate
                                        }),
                                    })
                                    const data = await res.json()
                                    console.log(data)
                                    setTimeSlots(data.time || [])
                                    console.log(data)
                                    console.log(data.time)
                                    await sendBotMessageWithDelay('Please select your time of visit!')
                                    setFormStep(9)
                                } catch {
                                    await sendBotMessageWithDelay('⚠️ Failed to fetch time slots.')
                                } finally {
                                    setIsTyping(false)
                                }
                            }}
                        >
                            <input
                                type="date"
                                className="border p-2"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                required
                                ref={dateInputRef}
                                min={new Date().toISOString().split('T')[0]}
                                disabled={isTyping}
                                placeholder='Appointment date'
                            />
                            <Button type="submit" disabled={isTyping}>Get Time Slots</Button>
                        </form>
                    )}

                    {/* Step 7: Time slot selection */}
                    {formStep === 9 && (
                        <form
                            className="flex flex-col gap-2"
                            onSubmit={async e => {
                                e.preventDefault()
                                const { name, gender, modeOfVisit, timeSlotId } = formData
                                const time: any = timeSlots.find((temp) => temp.time_id == formData.timeSlotId)
                                sendUserMessage(`Book me an appointment by ${time['Time'] || 'mentioned time'}`)
                                await submitFinalForm()
                                console.log(formData)
                                setFormStep(-1)
                                setFormData({
                                    branch_id: '',
                                    treatment_id: '',
                                    treatment_name: '',
                                    doctor_id: '',
                                    datetime: '',
                                    name: '',
                                    gender: '',
                                    phoneNumber: '',
                                    modeOfVisit: '',
                                    timeSlotId: '',
                                    patientId: ''
                                })
                                setNewData({
                                    FullName: '',
                                    EmailID: '',
                                    MobileNumber: formData.phoneNumber,
                                    Gender: '',
                                    DateOfBirth: ''
                                })
                                setOtp('')
                                setAccessToken(null)
                            }}
                        >
                            <select
                                className="border p-2 rounded"
                                value={formData.timeSlotId}
                                onChange={e => setFormData(prev => ({ ...prev, timeSlotId: e.target.value }))}
                                required
                                disabled={isTyping}
                            >
                                <option value="" disabled>
                                    Select Time Slot
                                </option>
                                {timeSlots.map(slot => (
                                    <option key={slot.time_id} value={slot.time_id}>
                                        {slot.Time}
                                    </option>
                                ))}
                            </select>

                            <Button type="submit" disabled={isTyping}>Confirm Appointment</Button>
                        </form>
                    )}

                </div>
            </div>
        </div>
    )
}