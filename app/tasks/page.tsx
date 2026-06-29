'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Task = {
  id: string
  title: string
  due_date: string
  priority: string
  completed: boolean
  contact_id: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user?.id)
      .order('due_date', { ascending: true })
    setTasks(data || [])
    setLoading(false)
  }

  async function addTask() {
    if (!title) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('tasks').insert({
      title, due_date: dueDate, priority, completed: false, user_id: user?.id
    })
    setTitle(''); setDueDate(''); setPriority('medium')
    setShowForm(false)
    fetchTasks()
  }

  async function toggleComplete(task: Task) {
    await supabase.from('tasks').update({ completed: !task.completed }).eq('id', task.id)
    fetchTasks()
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
  }

  const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
    low: { color: 'text-green-600', bg: 'bg-green-50', label: 'Low' },
    medium: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Medium' },
    high: { color: 'text-red-600', bg: 'bg-red-50', label: 'High' },
  }

  const isOverdue = (date: string) => date && new Date(date) < new Date() 

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    if (filter === 'overdue') return !t.completed && isOverdue(t.due_date)
    return true
  })

  const pendingCount = tasks.filter(t => !t.completed).length
  const overdueCount = tasks.filter(t => !t.completed && isOverdue(t.due_date)).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks & Reminders</h1>
            <p className="text-gray-500 mt-1">
              {pendingCount} pending
              {overdueCount > 0 && <span className="text-red-500 ml-2">· {overdueCount} overdue!</span>}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add Task
          </button>
        </div>

        {/* Add Task Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="font-bold text-gray-900 mb-4">New Task</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-1"
                placeholder="Task title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <input
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
              <select
                className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={priority}
                onChange={e => setPriority(e.target.value)}
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addTask} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-medium">
                Save Task
              </button>
              <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-200 font-medium">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'active', 'completed', 'overdue'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f} {f === 'overdue' && overdueCount > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">{overdueCount}</span>}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">✅</p>
            <p className="text-gray-500 font-medium">No tasks found</p>
            <p className="text-gray-400 text-sm mt-1">Add a task to get started</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(task => (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${
                  task.completed ? 'border-gray-100 opacity-60' : 
                  isOverdue(task.due_date) ? 'border-red-200 bg-red-50' : 'border-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleComplete(task)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {task.completed && '✓'}
                  </button>

                  {/* Title */}
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    {task.due_date && (
                      <p className={`text-xs mt-1 ${isOverdue(task.due_date) && !task.completed ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        📅 Due: {new Date(task.due_date).toLocaleDateString()} 
                        {isOverdue(task.due_date) && !task.completed && ' — Overdue!'}
                      </p>
                    )}
                  </div>

                  {/* Priority Badge */}
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${priorityConfig[task.priority]?.bg} ${priorityConfig[task.priority]?.color}`}>
                    {priorityConfig[task.priority]?.label}
                  </span>

                  {/* Delete */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-300 hover:text-red-500 transition-all text-lg"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}