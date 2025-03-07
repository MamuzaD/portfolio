"use client"

import emailjs from "@emailjs/browser"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  name: z.string().min(2, { message: "please include a name" }).max(50, {
    message: "that's a long name, could you use a nickname perhaps",
  }),
  email: z.string().email({ message: "please use a valid email" }),
  message: z.string().min(10, { message: "bit of a short message" }).max(500, {
    message: "bit of a long message, would you rather discuss in a meeting?",
  }),
})
interface ContactFormProps {
  setViewForm: (value: React.SetStateAction<boolean>) => void
  setDropdownOpen: (value: React.SetStateAction<boolean>) => void
}

const service = import.meta.env.PUBLIC_EMAILJS_SERVICE_ID
const template = import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID
const publicKey = import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY

export default function ContactForm({ setViewForm, setDropdownOpen }: ContactFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(false)
    const templateParams = {
      from_name: values.name,
      from_email: values.email,
      message: values.message,
    }

    emailjs.send(service, template, templateParams, { publicKey: publicKey }).then(
      () => {
        setIsSubmitted(true)
        setTimeout(() => {
          setViewForm(false)
        }, 2000)
      },
      (error) => {
        setError(true)
      }
    )
  }

  return (
    <div className="flex flex-col items-center">
      <h3
        className={`min-h-26 hover-underline-animation z-50 mb-4 cursor-pointer pb-5 text-center text-4xl font-bold`}
        onClick={() => {
          setViewForm(false)
          setDropdownOpen(true)
        }}
      >
        contact me
      </h3>
      {isSubmitted ? (
        <p className="text-2xl font-medium text-primary">sent! thanks for reaching out</p>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="name" {...field} className="bg-background/80 backdrop-blur" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        {...field}
                        className="bg-background/80 backdrop-blur"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="hey i saw your portfolio..."
                        {...field}
                        className="w-[22rem] bg-background/80 backdrop-blur md:w-96"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex place-items-center justify-between gap-4">
                <Button type="submit">Submit</Button>
                {error && <div className="mb-4 text-center font-medium text-red-600">{"something went wrong :("}</div>}
                <Button type="button" variant="secondary" onClick={() => setViewForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </>
      )}
    </div>
  )
}
