'use client'

import { useState, useRef } from 'react'
import { Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { conversationsAPI } from '@/lib/api'
import type { Conversation } from '@/lib/types'

const MAX_FILE_SIZE_KB = 600
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_KB * 1024

interface ImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

type ImportState = 'idle' | 'loading' | 'success' | 'error'

export function ImportDialog({ open, onOpenChange, onSuccess }: ImportDialogProps) {
    const [state, setState] = useState<ImportState>('idle')
    const [error, setError] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [importedTitle, setImportedTitle] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const resetState = () => {
        setState('idle')
        setError(null)
        setSelectedFile(null)
        setImportedTitle('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            resetState()
        }
        onOpenChange(isOpen)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError(null)
        setState('idle')

        // Validate file type
        if (!file.name.endsWith('.json')) {
            setError('Please select a JSON file.')
            return
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
            setError(`File too large. Maximum size is ${MAX_FILE_SIZE_KB} KB.`)
            return
        }

        setSelectedFile(file)
    }

    const handleImport = async () => {
        if (!selectedFile) return

        setState('loading')
        setError(null)

        try {
            const text = await selectedFile.text()

            // Parse and validate JSON
            let data: unknown
            try {
                data = JSON.parse(text)
            } catch {
                throw new Error('Invalid JSON file. Please check the file format.')
            }

            // Import the conversation
            const result = await conversationsAPI.import(data as Conversation)
            setImportedTitle(result.metadata.title)
            setState('success')
            onSuccess()
        } catch (err) {
            setState('error')
            setError(err instanceof Error ? err.message : 'Failed to import conversation')
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Import Conversation
                    </DialogTitle>
                    <DialogDescription>
                        Upload a JSON file containing a conversation. Maximum file size: {MAX_FILE_SIZE_KB} KB.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {state === 'success' ? (
                        <div className="flex flex-col items-center gap-3 py-6">
                            <div className="rounded-full bg-success/10 p-3">
                                <CheckCircle className="h-8 w-8 text-success" />
                            </div>
                            <p className="text-center font-medium">
                                Successfully imported!
                            </p>
                            <p className="text-center text-sm text-muted-foreground">
                                &quot;{importedTitle}&quot;
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* File input */}
                            <div
                                className={`
                  relative flex cursor-pointer flex-col items-center justify-center
                  rounded-lg border-2 border-dashed p-8 transition-colors
                  ${selectedFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                `}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {selectedFile ? (
                                    <>
                                        <FileJson className="mb-2 h-10 w-10 text-primary" />
                                        <p className="text-sm font-medium">{selectedFile.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            Click to select a JSON file
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter>
                    {state === 'success' ? (
                        <Button onClick={() => handleClose(false)}>
                            Done
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => handleClose(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={!selectedFile || state === 'loading'}
                            >
                                {state === 'loading' ? 'Importing...' : 'Import'}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
