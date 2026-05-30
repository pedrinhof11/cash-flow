import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { useTransactionSummary, useTransactions, useAccounts } from '../../src/hooks'
import { formatCurrency, formatDate, formatMonthYear, getMonthStartEnd } from '../../src/lib/utils'
import { Ionicons } from '@expo/vector-icons'

const SCREEN_WIDTH = Dimensions.get('window').width
const BAR_MAX_HEIGHT = 120

export default function DashboardScreen() {
  const [currentDate] = useState(new Date())
  const period = getMonthStartEnd(currentDate)
  const { data: summary } = useTransactionSummary({
    start_date: period.start,
    end_date: period.end,
  })
  const { data: transactionsData } = useTransactions({
    per_page: 5,
    start_date: period.start,
    end_date: period.end,
  })
  const { data: accountsData } = useAccounts()

  const totalBalance =
    accountsData?.accounts?.reduce((sum: number, acc: { current_balance: string }) => sum + parseFloat(acc.current_balance), 0) || 0

  const maxBarValue = Math.max(
    summary?.total_income || 0,
    summary?.total_expense || 0,
    1,
  )

  const incomeBarHeight = ((summary?.total_income || 0) / maxBarValue) * BAR_MAX_HEIGHT
  const expenseBarHeight = ((summary?.total_expense || 0) / maxBarValue) * BAR_MAX_HEIGHT

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{formatMonthYear(currentDate)}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, styles.balanceCard]}>
            <Text style={styles.summaryLabel}>Saldo Total</Text>
            <Text style={[styles.summaryValue, { color: totalBalance >= 0 ? '#059669' : '#dc2626' }]}>
              {formatCurrency(totalBalance)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="trending-up" size={20} color="#059669" />
            </View>
            <Text style={styles.summaryLabel}>Receitas</Text>
            <Text style={[styles.summaryValue, styles.incomeValue]}>
              {formatCurrency(summary?.total_income || 0)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="trending-down" size={20} color="#dc2626" />
            </View>
            <Text style={styles.summaryLabel}>Despesas</Text>
            <Text style={[styles.summaryValue, styles.expenseValue]}>
              {formatCurrency(summary?.total_expense || 0)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="wallet" size={20} color="#9333ea" />
            </View>
            <Text style={styles.summaryLabel}>Contas</Text>
            <Text style={[styles.summaryValue, { color: '#9333ea' }]}>
              {accountsData?.accounts?.length || 0}
            </Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Receitas vs Despesas</Text>
          <View style={styles.chartContainer}>
            <View style={styles.barWrapper}>
              <View style={styles.barValueContainer}>
                <Text style={styles.barLabel}>{formatCurrency(summary?.total_income || 0)}</Text>
              </View>
              <View style={[styles.bar, styles.incomeBar, { height: incomeBarHeight }]} />
              <Text style={styles.barName}>Receitas</Text>
            </View>
            <View style={styles.barWrapper}>
              <View style={styles.barValueContainer}>
                <Text style={styles.barLabel}>{formatCurrency(summary?.total_expense || 0)}</Text>
              </View>
              <View style={[styles.bar, styles.expenseBar, { height: expenseBarHeight }]} />
              <Text style={styles.barName}>Despesas</Text>
            </View>
          </View>
        </View>

        <View style={styles.recentCard}>
          <Text style={styles.recentTitle}>Transações Recentes</Text>
          {transactionsData?.data?.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma transação neste mês</Text>
          ) : (
            transactionsData?.data?.map((tx) => (
              <View key={tx.id} style={styles.transactionItem}>
                <View
                  style={[
                    styles.transactionIcon,
                    { backgroundColor: tx.type === 'income' ? '#d1fae5' : '#fee2e2' },
                  ]}
                >
                  <Ionicons
                    name={tx.type === 'income' ? 'arrow-up' : 'arrow-down'}
                    size={16}
                    color={tx.type === 'income' ? '#059669' : '#dc2626'}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDesc} numberOfLines={1}>
                    {tx.description || 'Sem descrição'}
                  </Text>
                  <Text style={styles.transactionDate}>{formatDate(tx.date)}</Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: tx.type === 'income' ? '#059669' : '#dc2626' },
                  ]}
                >
                  {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flex: 1,
    minWidth: (SCREEN_WIDTH - 48) / 2,
  },
  balanceCard: {
    flex: 2,
    minWidth: '100%',
  },
  cardIconContainer: {
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  incomeValue: {
    color: '#059669',
  },
  expenseValue: {
    color: '#dc2626',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: BAR_MAX_HEIGHT + 60,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barValueContainer: {
    marginBottom: 8,
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  bar: {
    width: 60,
    borderRadius: 8,
  },
  incomeBar: {
    backgroundColor: '#10b981',
  },
  expenseBar: {
    backgroundColor: '#ef4444',
  },
  barName: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
  },
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
})
