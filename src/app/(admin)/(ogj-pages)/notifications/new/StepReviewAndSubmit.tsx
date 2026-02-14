import { useFormContext } from "react-hook-form"

interface Props {
  isAdmin: boolean
}

export function StepReviewAndSubmit({ isAdmin }: Props) {
  const { getValues } = useFormContext()

  const values = getValues()

  return (
    <div className="space-y-4 text-sm">
      <div>
        <strong>Title:</strong> {values.title}
      </div>

      <div>
        <strong>Status on submit:</strong>{" "}
        {isAdmin ? "Published" : "Draft"}
      </div>
    </div>
  )
}
