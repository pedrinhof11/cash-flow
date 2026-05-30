import { describe, it, expect } from 'vitest'
import * as services from '../services'

describe('Services', () => {
  it('exports authService', () => {
    expect(services.authService).toBeDefined()
    expect(typeof services.authService.login).toBe('function')
    expect(typeof services.authService.register).toBe('function')
    expect(typeof services.authService.logout).toBe('function')
    expect(typeof services.authService.me).toBe('function')
  })

  it('exports accountService', () => {
    expect(services.accountService).toBeDefined()
    expect(typeof services.accountService.list).toBe('function')
    expect(typeof services.accountService.get).toBe('function')
    expect(typeof services.accountService.create).toBe('function')
    expect(typeof services.accountService.update).toBe('function')
    expect(typeof services.accountService.delete).toBe('function')
  })

  it('exports categoryService', () => {
    expect(services.categoryService).toBeDefined()
    expect(typeof services.categoryService.list).toBe('function')
    expect(typeof services.categoryService.get).toBe('function')
    expect(typeof services.categoryService.create).toBe('function')
    expect(typeof services.categoryService.update).toBe('function')
    expect(typeof services.categoryService.delete).toBe('function')
  })

  it('exports transactionService', () => {
    expect(services.transactionService).toBeDefined()
    expect(typeof services.transactionService.list).toBe('function')
    expect(typeof services.transactionService.summary).toBe('function')
    expect(typeof services.transactionService.get).toBe('function')
    expect(typeof services.transactionService.create).toBe('function')
    expect(typeof services.transactionService.update).toBe('function')
    expect(typeof services.transactionService.delete).toBe('function')
  })

  it('exports budgetService', () => {
    expect(services.budgetService).toBeDefined()
    expect(typeof services.budgetService.list).toBe('function')
    expect(typeof services.budgetService.current).toBe('function')
    expect(typeof services.budgetService.get).toBe('function')
    expect(typeof services.budgetService.create).toBe('function')
    expect(typeof services.budgetService.update).toBe('function')
    expect(typeof services.budgetService.delete).toBe('function')
  })

  it('exports recurringTransactionService', () => {
    expect(services.recurringTransactionService).toBeDefined()
    expect(typeof services.recurringTransactionService.list).toBe('function')
    expect(typeof services.recurringTransactionService.get).toBe('function')
    expect(typeof services.recurringTransactionService.create).toBe('function')
    expect(typeof services.recurringTransactionService.update).toBe('function')
    expect(typeof services.recurringTransactionService.delete).toBe('function')
    expect(typeof services.recurringTransactionService.skip).toBe('function')
  })
})
