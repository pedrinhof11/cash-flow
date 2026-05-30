import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useCurrentBudgets, useCreateBudget, useDeleteBudget, useCategories } from '../../src/hooks'
import { formatCurrency, PERIOD_LABELS } from '../../src/lib/utils'
import type { BudgetCurrent } from '../../src/types'

export default function BudgetsScreen() {
  const [modalVisible, setModalVisible] = useState(false)
  const [amount, setAmount] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [period, setPeriod] = useState<string>('monthly')

  const { data: budgetsData, isLoading } = useCurrentBudgets()
  const { data: categoriesData } = useCategories()
  const createBudget = useCreateBudget()
  const deleteBudget = useDeleteBudget()

  const expenseCategories = categoriesData?.categories?.filter((c: { type: string }) => c.type === 'expense') || []

  const handleCreate = async () => {
    if (!amount || !selectedCategoryId) {
      Alert.alert('Erro', 'Preencha valor e categoria')
      return
    }
    try {
      const now = new Date()
      const startDate = now.toISOString().split('T')[0]
      let endDate: string | undefined
      if (period === 'monthly') {
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      } else if (period === 'weekly') {
        endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      } else {
        endDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString().split('T')[0]
      }
      await createBudget.mutateAsync({
        category_id: selectedCategoryId,
        amount: parseFloat(amount),
        period,
        start_date: startDate,
        end_date: endDate,
      })
      setModalVisible(false)
      setAmount('')
      setSelectedCategoryId(null)
      Alert.alert('Sucesso', 'Orçamento criado')
    } catch {
      Alert.alert('Erro', 'Erro ao criar orçamento')
    }
  }

  const handleDelete = (id: number) => {
    Alert.alert('Excluir', 'Deseja excluir este orçamento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBudget.mutateAsync(id)
          } catch {
            Alert.alert('Erro', 'Erro ao excluir orçamento')
          }
        },
      },
    ])
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return '#dc2626'
    if (percentage >= 75) return '#f59e0b'
    return '#059669'
  }

  const renderBudget = ({ item }: { item: BudgetCurrent }) => (
    <View style={styles.budgetCard}>
      <View style={styles.budgetHeader}>
        <View>
          <Text style={styles.budgetCategory}>{item.category?.name || 'Sem categoria'}</Text>
          <Text style={styles.budgetPeriod}>{PERIOD_LABELS[item.period]}</Text>
        </View>
        <View style={styles.budgetActions}>
          {item.is_over_budget && (
            <Ionicons name="warning" size={18} color="#f59e0b" style={{ marginRight: 8 }} />
          )}
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(item.percentage_used, 100)}%`,
                backgroundColor: getProgressColor(item.percentage_used),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(item.percentage_used)}%</Text>
      </View>

      <View style={styles.budgetFooter}>
        <Text style={styles.spentText}>
          Gasto: {formatCurrency(item.spent)}
        </Text>
        <Text style={styles.limitText}>
          Limite: {formatCurrency(item.amount)}
        </Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orçamentos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={budgetsData?.budgets}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderBudget}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>Nenhum orçamento para o período atual</Text>
          ) : null
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Orçamento</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.label}>Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {expenseCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.chip,
                        selectedCategoryId === cat.id && styles.chipSelected,
                      ]}
                      onPress={() => setSelectedCategoryId(cat.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedCategoryId === cat.id && styles.chipTextSelected,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.label}>Valor Limite</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0,00"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Período</Text>
              <View style={styles.periodContainer}>
                {['weekly', 'monthly', 'yearly'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.periodButton,
                      period === p && styles.periodButtonSelected,
                    ]}
                    onPress={() => setPeriod(p)}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        period === p && styles.periodTextSelected,
                      ]}
                    >
                      {PERIOD_LABELS[p]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreate}
                disabled={createBudget.isPending}
              >
                <Text style={styles.submitButtonText}>Criar Orçamento</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#059669',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 40,
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  budgetPeriod: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  budgetActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 40,
    textAlign: 'right',
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spentText: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '500',
  },
  limitText: {
    fontSize: 13,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalBody: {
    padding: 16,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  chipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  chipTextSelected: {
    color: '#fff',
  },
  periodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  periodButtonSelected: {
    backgroundColor: '#d1fae5',
    borderColor: '#059669',
  },
  periodText: {
    fontSize: 13,
    color: '#6b7280',
  },
  periodTextSelected: {
    color: '#059669',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
