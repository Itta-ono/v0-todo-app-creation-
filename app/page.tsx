"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Calendar, Tag, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  text: string
  completed: boolean
  reminder?: string
  tags: string[]
  subtasks: Task[]
  expanded?: boolean
  parentId?: string
}

interface TagColor {
  name: string
  color: string
}

const defaultTagColors: TagColor[] = [
  { name: "work", color: "bg-blue-500" },
  { name: "personal", color: "bg-green-500" },
  { name: "urgent", color: "bg-red-500" },
  { name: "shopping", color: "bg-purple-500" },
  { name: "health", color: "bg-orange-500" },
]

const availableColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-cyan-500",
]

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskText, setNewTaskText] = useState("")
  const [newTaskReminder, setNewTaskReminder] = useState("")
  const [newTaskTags, setNewTaskTags] = useState("")
  const [tagColors, setTagColors] = useState<TagColor[]>(defaultTagColors)
  const [editingTag, setEditingTag] = useState<string | null>(null)

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addTask = (parentId?: string) => {
    if (!newTaskText.trim()) return

    const tags = newTaskTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    // Add new tags to tagColors if they don't exist
    tags.forEach((tag) => {
      if (!tagColors.find((tc) => tc.name === tag)) {
        setTagColors((prev) => [
          ...prev,
          {
            name: tag,
            color: availableColors[Math.floor(Math.random() * availableColors.length)],
          },
        ])
      }
    })

    const newTask: Task = {
      id: generateId(),
      text: newTaskText,
      completed: false,
      reminder: newTaskReminder || undefined,
      tags,
      subtasks: [],
      parentId,
    }

    if (parentId) {
      setTasks((prev) =>
        prev.map((task) => (task.id === parentId ? { ...task, subtasks: [...task.subtasks, newTask] } : task)),
      )
    } else {
      setTasks((prev) => [...prev, newTask])
    }

    setNewTaskText("")
    setNewTaskReminder("")
    setNewTaskTags("")
  }

  const deleteTask = (taskId: string, parentId?: string) => {
    if (parentId) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === parentId ? { ...task, subtasks: task.subtasks.filter((subtask) => subtask.id !== taskId) } : task,
        ),
      )
    } else {
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
    }
  }

  const toggleTask = (taskId: string, parentId?: string) => {
    if (parentId) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === parentId
            ? {
                ...task,
                subtasks: task.subtasks.map((subtask) =>
                  subtask.id === taskId ? { ...subtask, completed: !subtask.completed } : subtask,
                ),
              }
            : task,
        ),
      )
    } else {
      setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
    }
  }

  const toggleExpanded = (taskId: string) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, expanded: !task.expanded } : task)))
  }

  const updateTagColor = (tagName: string, newColor: string) => {
    setTagColors((prev) => prev.map((tag) => (tag.name === tagName ? { ...tag, color: newColor } : tag)))
    setEditingTag(null)
  }

  const getTagColor = (tagName: string) => {
    return tagColors.find((tc) => tc.name === tagName)?.color || "bg-gray-500"
  }

  const TaskItem = ({ task, parentId }: { task: Task; parentId?: string }) => (
    <div className="space-y-2">
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-colors",
          task.completed ? "bg-muted/50" : "bg-card",
        )}
      >
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => toggleTask(task.id, parentId)}
          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />

        <div className="flex-1 min-w-0">
          <div className={cn("text-sm font-medium", task.completed && "line-through text-muted-foreground")}>
            {task.text}
          </div>

          {task.reminder && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {new Date(task.reminder).toLocaleString()}
            </div>
          )}

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={cn("text-xs text-white cursor-pointer", getTagColor(tag))}
                  onClick={() => setEditingTag(editingTag === tag ? null : tag)}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {task.subtasks.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => toggleExpanded(task.id)} className="p-1 h-auto">
              {task.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteTask(task.id, parentId)}
            className="p-1 h-auto text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {task.expanded && task.subtasks.length > 0 && (
        <div className="ml-6 space-y-2">
          {task.subtasks.map((subtask) => (
            <TaskItem key={subtask.id} task={subtask} parentId={task.id} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">My Tasks</CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {/* Add Task Form */}
            <div className="space-y-4 mb-6">
              <Input
                placeholder="Add a new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTask()}
                className="border-blue-200 focus:border-blue-500"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  type="datetime-local"
                  placeholder="Set reminder"
                  value={newTaskReminder}
                  onChange={(e) => setNewTaskReminder(e.target.value)}
                  className="border-blue-200 focus:border-blue-500"
                />

                <Input
                  placeholder="Tags (comma separated)"
                  value={newTaskTags}
                  onChange={(e) => setNewTaskTags(e.target.value)}
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <Button onClick={() => addTask()} className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>

            {/* Tag Color Editor */}
            {editingTag && (
              <Card className="mb-4 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium">Change color for "{editingTag}"</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        className={cn("w-8 h-8 rounded-full border-2 border-white shadow-md", color)}
                        onClick={() => updateTagColor(editingTag, color)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tasks List */}
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks yet. Add one above to get started!
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id}>
                    <TaskItem task={task} />

                    {/* Add Subtask Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const subtaskText = prompt("Enter subtask:")
                        if (subtaskText?.trim()) {
                          const subtask: Task = {
                            id: generateId(),
                            text: subtaskText,
                            completed: false,
                            tags: [],
                            subtasks: [],
                            parentId: task.id,
                          }
                          setTasks((prev) =>
                            prev.map((t) =>
                              t.id === task.id ? { ...t, subtasks: [...t.subtasks, subtask], expanded: true } : t,
                            ),
                          )
                        }
                      }}
                      className="ml-6 mt-2 text-blue-600 hover:text-blue-700 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Subtask
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
