'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UploadCloud } from "lucide-react";
import Roller from "@/components/ui/roller";

export default function Home() {        
    const router = useRouter()

    const [FormData, setFormData] = useState({
        org_id: '',
        content: ''
    });

    const [loading, setloading] = useState(false)

    // useEffect(() =>{
    //     const organization_id : any = localStorage.getItem('org_id')
    //     if(!organization_id || organization_id == ''){
    //         router.replace('/auth')
    //         return
    //     }
    //     setFormData(prev => ({...prev, org_id : organization_id}))
    // }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setloading(true)
            const res = await fetch("http://localhost:8000/data/scrape",{
                method : "POST",
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify({
                    organizationId : FormData.org_id,
                    instructions : FormData.content
                })
            })

            const data = await res.json()
            if(data['status']){
                setFormData(prev => ({...prev, content : ''}))
            } else {
                alert("Scraping content failed!")
            }

        } catch (error) {
            console.log(error)
        } finally {
            setloading(false)
        }
    }

    const handleLogout = () => {
        localStorage.clear()
        router.replace("/auth")
    }

    return (
        <main className="min-h-screen flex flex-col md:flex-row bg-gray-100">
            {/* Left Panel: Branding */}
            <div className="w-full md:w-1/3 flex flex-col gap-2 items-center justify-center bg-black p-8">
                <img src="/logo.png" className="h-24 w-24" alt="" />
                <h1 className="text-4xl font-bold text-white text-center">CMS Platform for
                    <p className="text-blue-600">Chatbot</p>
                </h1>
            </div>

            {/* Right Panel: Form */}
            <div className="w-full md:w-2/3 flex items-center justify-center bg-white p-6 md:p-12 relative">
                {/* Logout Button (top right corner of the right panel) */}

                {/* Form Container */}
                <div className="w-full max-w-2xl space-y-6">
                    <h2 className="text-3xl font-normal text-center">Customize your Chatbot</h2>
                    <form className="space-y-4 text-2xl" onSubmit={handleSubmit}>
                        {/* Organization ID */}
                        <div className="flex flex-col gap-1">
                            <label className="md:text-sm text-gray-600">Organization ID
                                <span className="text-red-600"> *</span>
                            </label>
                            <Input
                                placeholder="Enter the organization id"
                                value={FormData.org_id}
                                onChange={(e) =>
                                    setFormData(prev => ({ ...prev, org_id: e.target.value }))
                                }
                                className="md:text-md"
                                required
                                disabled
                            />
                        </div>
                        {/* Text Content */}
                        <div className="flex flex-col gap-1">
                            <label className="md:text-sm text-gray-600">Instructions</label>
                            <Textarea
                                placeholder="Enter your instructions"
                                className="h-24 resize-none md:text-md"
                                value={FormData.content}
                                onChange={(e) =>
                                    setFormData(prev => ({ ...prev, content: e.target.value }))
                                }
                            />
                        </div>

                        {/* Submit Button */}
                        <Button className="w-full mt-2 text-lg cursor-pointer" type="submit">
                            <UploadCloud className="w-5 h-5 mr-2" />
                            {loading ? <Roller /> : 'Update chatbot'}
                        </Button>

                        <Button
                            className="w-full mt-2 text-lg bg-red-500 hover:bg-red-400 cursor-pointer"
                            onClick={handleLogout}
                            disabled={loading}
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            Log out
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    );
}