import data from '@/data/engineers.json'
import { Engineer } from './types'

const engineers = data.engineers as Engineer[]

export function getAllEngineers(): Engineer[] {
  return engineers
}

export function getEngineerById(id: string): Engineer | undefined {
  return engineers.find((e) => e.id === id)
}

export function getEngineerByEmail(email: string): Engineer | undefined {
  return engineers.find((e) => e.email === email)
}

export function getTeams() {
  return data.teams
}

export function getEngineersByTeam(teamId: string): Engineer[] {
  return engineers.filter((e) => e.teamId === teamId)
}

export function getManagers(): Engineer[] {
  return engineers.filter((e) => e.role === 'manager')
}

// Default dev view — first non-manager engineer (simulates logged-in user)
export function getCurrentEngineer(): Engineer {
  return engineers.find((e) => e.role === 'individual_contributor')!
}
