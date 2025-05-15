'use client'

import { useState } from 'react'
import { CalendarIcon, ClockIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function MenuPanel({
  onSubmit,
}: {
  onSubmit: (data: {
    dropdown: string
    date: Date | undefined
    time: string
  }) => void
}) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState('')
  const [dropdown, setDropdown] = useState('option1')

  const handleSubmit = () => {
    onSubmit({ dropdown, date, time })
  }

  return (
    <div className="w-full border rounded-md p-4 bg-gray-50 space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Select an Option</label>
        <Select value={dropdown} onValueChange={setDropdown}>
          <SelectTrigger>
            <SelectValue placeholder="Choose an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium flex items-center gap-1">
          <CalendarIcon className="w-4 h-4" />
          Pick a Date
        </label>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium flex items-center gap-1">
          <ClockIcon className="w-4 h-4" />
          Select Time
        </label>
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>

      <Button onClick={handleSubmit} className="w-full mt-2">
        Submit
      </Button>
    </div>
  )
}
