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

  // UPDATED: dark mode colors added in priorityConfig
  const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
    low: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Low' },
    medium: { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'Medium' },
    high: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', label: 'High' },
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
    // UPDATED: dark:bg-gray-950 added
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            {/* UPDATED: dark:text-white added */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks & Reminders</h1>
            {/* UPDATED: dark:text-gray-400 added */}
            <p className="text-gray-500 dark:text-gray-400 mt-1">
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

        {showForm && (
          // UPDATED: dark:bg-gray-900 dark:border-gray-800 added
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
            {/* UPDATED: dark:text-white added */}
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">New Task</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* UPDATED: dark classes added on input */}
              <input
                className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-1"
                placeholder="Task title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              {/* UPDATED: dark classes added on date input */}
              <input
                className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
              {/* UPDATED: dark classes added on select */}
              <select
                className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {/* UPDATED: dark:bg-gray-800 dark:text-gray-300 added */}
              <button onClick={() => setShowForm(false)} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-xl font-medium">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'active', 'completed', 'overdue'].map(f => (
            // UPDATED: dark classes added on filter buttons
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {f} {f === 'overdue' && overdueCount > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">{overdueCount}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">✅</p>
            {/* UPDATED: dark:text-gray-400 added */}
            <p className="text-gray-500 dark:text-gray-400 font-medium">No tasks found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Add a task to get started</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(task => (
              // UPDATED: dark classes added on task card
              <div
                key={task.id}
                className={`bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border transition-all ${
                  task.completed ? 'border-gray-100 dark:border-gray-800 opacity-60' :
                  isOverdue(task.due_date) ? 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800' :
                  'border-gray-100 dark:border-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* UPDATED: dark:border-gray-600 added on checkbox */}
                  <button
                    onClick={() => toggleComplete(task)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                    }`}
                  >
                    {task.completed && '✓'}
                  </button>

                  <div className="flex-1">
                    {/* UPDATED: dark:text-white added on title */}
                    <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                      {task.title}
                    </p>
                    {task.due_date && (
                      // UPDATED: dark:text-gray-500 added on date
                      <p className={`text-xs mt-1 ${isOverdue(task.due_date) && !task.completed ? 'text-red-500 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                        📅 Due: {new Date(task.due_date).toLocaleDateString()}
                        {isOverdue(task.due_date) && !task.completed && ' — Overdue!'}
                      </p>
                    )}
                  </div>

                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${priorityConfig[task.priority]?.bg} ${priorityConfig[task.priority]?.color}`}>
                    {priorityConfig[task.priority]?.label}
                  </span>

                  {/* UPDATED: dark:text-gray-600 added on delete button */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-300 dark:text-gray-600 hover:text-red-500 transition-all text-lg"
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