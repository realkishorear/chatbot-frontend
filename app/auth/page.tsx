'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Roller from "@/components/ui/roller";

export default function Auth() {

    const router = useRouter()

    const [auth, setAuth] = useState({
        username: '',
        passcode: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e : React.FormEvent) => {
        e.preventDefault()

        if(!auth.username.trim() || !auth.passcode.trim()){
            alert("Please fill in the fields!")
            return
        }

        try {
            setLoading(true)
            const res = await fetch("http://localhost:8000/data/login", {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify({
                    username : auth.username,
                    password : auth.passcode
                })
            })
            const data = await res.json()
            if(data['allow']){
                router.push('/home')
                localStorage.setItem('org_id', `${data['organization_id']}`)
            }
            else{
                router.push("/auth")
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-teal-100 px-4 sm:px-6 lg:px-8">
            <section className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 space-y-6">
                <div className="flex flex-col justify-center items-center">
                    <img src="/logo.png" alt="" className="h-15 w-15" />
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-800 text-center">
                        CMS Login
                    </h2>
                </div>
                <form
                    className="space-y-5 text-sm sm:text-base md:text-lg"
                    onSubmit={handleSubmit}
                >
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm sm:text-base font-medium text-gray-800">Username</label>
                        <Input
                            className="bg-gray-50 border border-gray-200 py-3 sm:py-4 md:py-5 text-sm sm:text-base md:text-md"
                            placeholder="Enter your username"
                            type='text'
                            value={auth.username}
                            onChange={(e) =>
                                setAuth(prev => ({ ...prev, username: e.target.value }))
                            }
                        />
                    </div>
                    <div className="flex flex-col space-y-2 relative">
                        <label className="text-sm sm:text-base font-medium text-gray-800">Password</label>
                        <Input
                            className="bg-gray-50 border border-gray-200 py-3 sm:py-4 md:py-5 pr-12 text-sm sm:text-base md:text-md"
                            placeholder="Enter your password"
                            type={showPassword ? 'text' : 'password'}
                            value={auth.passcode}
                            onChange={(e) =>
                                setAuth(prev => ({ ...prev, passcode: e.target.value }))
                            }
                        />
                        <span
                            className="absolute right-3 top-11 text-gray-500 cursor-pointer"
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </span>
                    </div>
                    <Button type="submit" className="w-full text-white text-sm sm:text-base md:text-lg py-3 sm:py-4 cursor-pointer select-none">
                        {!loading ? 'Login' : <Roller />}
                    </Button>
                </form>
            </section>
        </main>
    );
}
