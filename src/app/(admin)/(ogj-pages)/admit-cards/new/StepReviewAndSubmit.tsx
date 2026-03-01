
import React, { useState } from "react"
import { useFormContext } from "react-hook-form"

interface Props {
  isAdmin: boolean
}

export function StepReviewAndSubmit({ isAdmin }: Props) {
  const { getValues, formState } = useFormContext()
  const values = getValues()
  const errors = formState.errors || {}
  const [showSeo, setShowSeo] = useState(true)
  const [showCore, setShowCore] = useState(true)
  const [showAi, setShowAi] = useState(false)

  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // AI summary suggestion (stub)
  const aiSummary = values.metaDescription
    ? `AI Suggestion: ${values.metaDescription.slice(0, 80)}...`
    : "AI can suggest a summary here.";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <span className="material-icons text-blue-500">fact_check</span>
          Review & Submit
        </h2>

        {/* Error summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-300 rounded p-3 mb-4">
            <h3 className="font-semibold text-red-700 mb-2 text-sm">Please fix the following errors:</h3>
            <ul className="list-disc pl-5 text-red-600 text-sm">
              {Object.entries(errors).map(([key, err]: any) => (
                <li key={key}>{err?.message || key}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Collapsible Core Section */}
        <div className="border-b pb-4 mb-4">
          <button type="button" className="flex items-center gap-2 text-lg font-semibold mb-2" onClick={() => setShowCore((v: boolean) => !v)}>
            <span className="material-icons text-gray-500">folder_open</span>
            Core Details
            <span className="material-icons text-xs ml-2">{showCore ? "expand_less" : "expand_more"}</span>
          </button>
          {showCore && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-icons text-gray-400">title</span>
                <span className="font-semibold">Title:</span>
                <span className="ml-2 text-gray-800 font-mono bg-gray-50 px-2 py-1 rounded cursor-pointer" title="Copy" onClick={() => copyToClipboard(values.title || "")}>{values.title || <span className="text-gray-400">(Not set)</span>}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-icons text-gray-400">info</span>
                <span className="font-semibold">Status on submit:</span>
                <span className="ml-2 text-gray-800">{isAdmin ? "Published" : "Draft"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible SEO Section */}
        <div className="border-b pb-4 mb-4">
          <button type="button" className="flex items-center gap-2 text-lg font-semibold mb-2" onClick={() => setShowSeo((v: boolean) => !v)}>
            <span className="material-icons text-blue-400">seo</span>
            SEO Details
            <span className="material-icons text-xs ml-2">{showSeo ? "expand_less" : "expand_more"}</span>
          </button>
          {showSeo && (
            <div className="space-y-3">
              {values.metaTitle && (
                <div className="flex items-center gap-2">
                  <span className="material-icons text-blue-400">title</span>
                  <span className="font-semibold">Meta Title:</span>
                  <span className="ml-2 text-gray-800 font-mono bg-blue-50 px-2 py-1 rounded cursor-pointer" title="Copy" onClick={() => copyToClipboard(values.metaTitle)}>{values.metaTitle}</span>
                </div>
              )}
              {values.metaDescription && (
                <div className="flex items-center gap-2">
                  <span className="material-icons text-green-400">description</span>
                  <span className="font-semibold">Meta Description:</span>
                  <span className="ml-2 text-gray-800 font-mono bg-green-50 px-2 py-1 rounded cursor-pointer" title="Copy" onClick={() => copyToClipboard(values.metaDescription)}>{values.metaDescription}</span>
                </div>
              )}
              {values.seoCanonicalUrl && (
                <div className="flex items-center gap-2">
                  <span className="material-icons text-orange-400">link</span>
                  <span className="font-semibold">Canonical URL:</span>
                  <span className="ml-2 text-gray-800 font-mono bg-orange-50 px-2 py-1 rounded cursor-pointer" title="Copy" onClick={() => copyToClipboard(values.seoCanonicalUrl)}>{values.seoCanonicalUrl}</span>
                </div>
              )}
              {/* Add more SEO fields as needed */}
            </div>
          )}
        </div>

        {/* Collapsible AI Section */}
        <div className="border-b pb-4 mb-4">
          <button type="button" className="flex items-center gap-2 text-lg font-semibold mb-2" onClick={() => setShowAi((v: boolean) => !v)}>
            <span className="material-icons text-purple-400">smart_toy</span>
            AI Summary
            <span className="material-icons text-xs ml-2">{showAi ? "expand_less" : "expand_more"}</span>
          </button>
          {showAi && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-icons text-purple-400">lightbulb</span>
                <span className="font-semibold">AI Suggestion:</span>
                <span className="ml-2 text-gray-800 font-mono bg-purple-50 px-2 py-1 rounded cursor-pointer" title="Copy" onClick={() => copyToClipboard(aiSummary)}>{aiSummary}</span>
              </div>
            </div>
          )}
        </div>

        {/* Admin controls */}
        <div className="flex justify-end gap-3 mt-6">
          {isAdmin ? (
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold shadow">
              Publish
            </button>
          ) : (
            <button type="submit" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-semibold shadow">
              Save as Draft
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
