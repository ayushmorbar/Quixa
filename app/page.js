'use client'

import { Box, Button, Stack, TextField, Paper, IconButton, Typography, Avatar } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import { Brightness4, Brightness7 } from '@mui/icons-material'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Quixa, your AI-powered support assistant. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return
    setIsLoading(true)

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor={darkMode ? '#121212' : '#f5f5f5'}
      p={2}
      fontFamily="'Roboto', sans-serif"
    >
      <IconButton
        sx={{ position: 'fixed', top: 16, right: 16 }}
        onClick={toggleDarkMode}
        color="inherit"
      >
        {darkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
      <Paper
        elevation={3}
        sx={{
          width: '500px',
          height: '700px',
          p: 2,
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: darkMode ? '#424242' : '#ffffff',
          color: darkMode ? '#ffffff' : '#000000',
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
          p={2}
          borderBottom={`1px solid ${darkMode ? '#616161' : '#e0e0e0'}`}
        >
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: darkMode ? 'primary.dark' : 'primary.main', mr: 2 }}>Q</Avatar>
            <Typography variant="h6">Quixa</Typography>
          </Box>
        </Box>
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          p={2}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                sx={{
                  bgcolor: message.role === 'assistant' ? (darkMode ? 'primary.dark' : 'primary.main') : (darkMode ? 'secondary.dark' : 'secondary.main'),
                  color: 'white',
                  borderRadius: 4,
                  p: 2,
                  boxShadow: 1,
                  maxWidth: '75%',
                  wordWrap: 'break-word',
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2} mt={2} p={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            sx={{
              bgcolor: darkMode ? '#616161' : '#ffffff',
              color: darkMode ? '#ffffff' : '#000000',
              borderRadius: 4,
            }}
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={isLoading}
            sx={{ minWidth: '100px', borderRadius: 4 }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}