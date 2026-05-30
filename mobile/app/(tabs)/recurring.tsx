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
import { useRecurringTransactions, useCreateRecurringTransaction, useDeleteRecurringTransaction, useSkipRecurringTransaction, useAccounts, useCategories } from '../../src/hooks'
import { formatCurrency, formatDate, FREQUENCY_LABELS } from '../../src/lib/utils'
import type { RecurringTransaction } from '../../src/types'

export default function RecurringScreen() {
  const [modalVisible, setModalVisible] = useState(false)
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<string>('monthly')
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  const { data: recurringData, isLoading } = useRecurringTransactions()
  const { data: accountsData } = useAccounts()
  const { data: categoriesData } = useCategories()
  const createRecurring = useCreateRecurringTransaction()
  const deleteRecurring = useDeleteRecurringTransaction()
  const skipRecurring = useSkipRecurringTransaction()

  const handleCreate = async () => {
    if (!amount || !selectedAccountId) {
      Alert.alert('Erro', 'Preencha valor e conta')
      return
    }
    try {
      await createRecurring.mutateAsync({
        account_id: selectedAccountId,
        category_id: selectedCategoryId || undefined,
        type,
        amount: parseFloat(amount),
        description: description || undefined,
        frequency,
        start_date: startDate,
      })
      setModalVisible(false)
      resetForm()
      Alert.alert('Sucesso', 'Transação recorrente criada')
    } catch {
      Alert.alert('Erro', 'Erro ao criar transação recorrente')
    }
  }

  const handleDelete = (id: number) => {
    Alert.alert('Excluir', 'Deseja excluir esta transação recorrente?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecurring.mutateAsync(id)
          } catch {
            Alert.alert('Erro', 'Erro ao excluir')
          }
        },
      },
    ])
  }

  const handleSkip = async (id: number) => {
    try {
      await skipRecurring.mutateAsync(id)
      Alert.alert('Sucesso', 'Próxima ocorrência adiada')
    } catch {
      Alert.alert('Erro', 'Erro ao pular ocorrência')
    }
  }

  const resetForm = () => {
    setAmount('')
    setDescription('')
    setStartDate(new Date().toISOString().split('T')[0])
    setSelectedAccountId(null)
    setSelectedCategoryId(null)
    setType('expense')
    setFrequency('monthly')
  }

  const renderRecurring = ({ item }: { item: RecurringTransaction }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: item.type === 'income' ? '#d1fae5' : '#fee2e2' },
        ]}>
          <Ionicons
            name={item.type === 'income' ? 'arrow-up' : 'arrow-down'}
            size={18}
            color={item.type === 'income' ? '#059669' : '#dc2626'}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.description} numberOfLines={1}>
            {item.description || 'Sem descrição'}
          </Text>
          <Text style={styles.meta}>
            {item.category?.name} • {item.account?.name}
          </Text>
        </View>
        <Text style={[
          styles.amount,
          { color: item.type === 'income' ? '#059669' : '#dc2626' },
        ]}>
          {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <Text style={styles.frequency}>{FREQUENCY_LABELS[item.frequency]}</Text>
          <Text style={styles.nextDate}>Próxima: {formatDate(item.next_due)}</Text>
        </View>
        <View style={styles.footerActions}>
          <TouchableOpacity onPress={() => handleSkip(item.id)} style={styles.actionBtn}>
            <Ionicons name="play-skip-forward" size={18} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recorrentes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => { resetForm(); setModalVisible(true) }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={recurringData?.recurring_transactions}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRecurring}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>Nenhuma transação recorrente</Text>
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
              <Text style={styles.modalTitle}>Nova Transação Recorrente</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
                  onPress={() => setType('income')}
                >
                  <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>
                    Receita
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]}
                  onPress={() => setType('expense')}
                >
                  <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActiveExpense]}>
                    Despesa
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Valor</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0,00"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Descrição (opcional)"
              />

              <Text style={styles.label}>Frequência</Text>
              <View style={styles.chipContainer}>
                {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.chip,
                      frequency === key && styles.chipSelected,
                    ]}
                    onPress={() => setFrequency(key)}
                  >
                    <Text style={[
                      styles.chipText,
                      frequency === key && styles.chipTextSelected,
                    ]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Conta</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {accountsData?.accounts?.map((acc) => (
                    <TouchableOpacity
                      key={acc.id}
                      style={[
                        styles.chip,
                        selectedAccountId === acc.id && styles.chipSelected,
                      ]}
                      onPress={() => setSelectedAccountId(acc.id)}
                    >
                      <Text style={[
                        styles.chipText,
                        selectedAccountId === acc.id && styles.chipTextSelected,
                      ]}>
                        {acc.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.label}>Início</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreate}
                disabled={createRecurring.isPending}
              >
                <Text style={styles.submitButtonText}>Criar Recorrência</Text>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  meta: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
  },
  footerLeft: {
    gap: 2,
  },
  frequency: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  nextDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 4,
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
  typeToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#d1fae5',
    borderColor: '#059669',
  },
  typeButtonActiveExpense: {
    backgroundColor: '#fee2e2',
    borderColor: '#dc2626',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#059669',
  },
  typeButtonTextActiveExpense: {
    color: '#dc2626',
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
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
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
    fontSize: 13,
    color: '#6b7280',
  },
  chipTextSelected: {
    color: '#fff',
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
