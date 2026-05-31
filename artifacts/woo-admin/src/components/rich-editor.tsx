import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Highlight from "@tiptap/extension-highlight"
import Placeholder from "@tiptap/extension-placeholder"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  RotateCw,
  Highlighter,
  Code,
  Minus,
} from "lucide-react"

interface RichEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  className?: string
}

export function RichEditor({
  value,
  onChange,
  placeholder,
  minHeight = "160px",
  className,
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? "Write something..." }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "rich-editor-content focus:outline-none",
        style: `min-height: ${minHeight}; padding: 12px 14px;`,
      },
    },
  })

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const current = editor.getHTML()
      if (value !== current && value !== "" && value !== "<p></p>") {
        editor.commands.setContent(value, false)
      }
    }
  }, [value])

  if (!editor) return null

  const Btn = ({
    onClick,
    active,
    children,
    title,
    disabled,
  }: {
    onClick: () => void
    active?: boolean
    children: React.ReactNode
    title: string
    disabled?: boolean
  }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      disabled={disabled}
      className={cn(
        "h-7 w-7 inline-flex items-center justify-center rounded transition-colors shrink-0",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
        disabled && "opacity-30 cursor-not-allowed pointer-events-none"
      )}
    >
      {children}
    </button>
  )

  const Divider = () => <div className="w-px h-5 bg-border mx-0.5 shrink-0" />

  return (
    <div
      className={cn(
        "border border-border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-ring transition-shadow",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-border bg-muted/30 min-h-[40px]">
        <Btn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
          title="Highlight"
        >
          <Highlighter className="h-3.5 w-3.5" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline code"
        >
          <Code className="h-3.5 w-3.5" />
        </Btn>
        <Divider />
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </Btn>
        <Divider />
        <Btn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="h-3.5 w-3.5" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          active={false}
          title="Horizontal rule"
        >
          <Minus className="h-3.5 w-3.5" />
        </Btn>
        <Divider />
        <Btn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align left"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align center"
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align right"
        >
          <AlignRight className="h-3.5 w-3.5" />
        </Btn>
        <Divider />
        <Btn
          onClick={() => {
            const prev = editor.getAttributes("link").href ?? ""
            const url = window.prompt("Enter URL", prev)
            if (url === null) return
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run()
            } else {
              editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
            }
          }}
          active={editor.isActive("link")}
          title="Insert link"
        >
          <Link2 className="h-3.5 w-3.5" />
        </Btn>
        <Divider />
        <Btn
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
          title="Undo"
          disabled={!editor.can().undo()}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
          title="Redo"
          disabled={!editor.can().redo()}
        >
          <RotateCw className="h-3.5 w-3.5" />
        </Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
