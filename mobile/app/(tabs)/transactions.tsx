import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTransactions, useCreateTransaction, useDeleteTransaction, useAccounts, useCategories } from '../../src/hooks'
import { formatCurrency, formatDate } from '../../src/lib/utils'
import type { Transaction } from '../../src/types'

export default function TransactionsScreen() {
  const [modalVisible, setModalVisible] = useState(false)
  const [type, setType] = useState<'income' | 'expense'>('income')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const { data: transactionsData, isLoading } = useTransactions({ per_page: 20, page })
  const { data: accountsData } = useAccounts()
  const { data: categoriesData } = useCategories()
  const createTransaction = useCreateTransaction()
  const deleteTransaction = useDeleteTransaction()

  const filteredCategories = categoriesData?.categories?.filter((c: { type: string }) => c.type === type) || []

  const handleCreate = async () => {
    if (!amount || !selectedAccountId) {
      Alert.alert('Erro', 'Preencha valor e conta')
      return
    }
    try {
      await createTransaction.mutateAsync({
        account_id: selectedAccountId,
        category_id: selectedCategoryId || undefined,
        type,
        amount: parseFloat(amount),
        description: description || undefined,
        date,
      })
      setModalVisible(false)
      resetForm()
      Alert.alert('Sucesso', 'Transação criada')
    } catch {
      Alert.alert('Erro', 'Erro ao criar transação')
    }
  }

  const handleDelete = (id: number) => {
    Alert.alert('Excluir', 'Deseja excluir esta transação?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTransaction.mutateAsync(id)
          } catch {
            Alert.alert('Erro', 'Erro ao excluir transação')
          }
        },
      },
    ])
  }

  const resetForm = () => {
    setAmount('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setSelectedAccountId(null)
    setSelectedCategoryId(null)
    setType('income')
  }

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <TouchableOpacity
        style={[
          styles.transactionIcon,
          { backgroundColor: item.type === 'income' ? '#d1fae5' : '#fee2e2' },
        ]}
      >
        <Ionicons
          name={item.type === 'income' ? 'arrow-up' : 'arrow-down'}
          size={18}
          color={item.type === 'income' ? '#059669' : '#dc2626'}
        />
      </TouchableOpacity>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDesc} numberOfLines={1}>
          {item.description || 'Sem descrição'}
        </Text>
        <Text style={styles.transactionMeta}>
          {item.category?.name} • {formatDate(item.date)}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: item.type === 'income' ? '#059669' : '#dc2626' },
        ]}
      >
        {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
      </Text>
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={18} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transações</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setModalVisible(true) }}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactionsData?.data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTransaction}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.emptyText}>Nenhuma transação encontrada</Text> : null
        }
        contentContainerStyle={styles.list}
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
              <Text style={styles.modalTitle}>Nova Transação</Text>
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

              <Text style={styles.label}>Data</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
              />

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

              <Text style={styles.label}>Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  <TouchableOpacity
                    style={[styles.chip, !selectedCategoryId && styles.chipSelected]}
                    onPress={() => setSelectedCategoryId(null)}
                  >
                    <Text style={[styles.chipText, !selectedCategoryId && styles.chipTextSelected]}>
                      Nenhuma
                    </Text>
                  </TouchableOpacity>
                  {filteredCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.chip,
                        selectedCategoryId === cat.id && styles.chipSelected,
                      ]}
                      onPress={() => setSelectedCategoryId(cat.id)}
                    >
                      <Text style={[
                        styles.chipText,
                        selectedCategoryId === cat.id && styles.chipTextSelected,
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreate}
                disabled={createTransaction.isPending}
              >
                <Text style={styles.submitButtonText}>Criar Transação</Text>
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
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  transactionMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  deleteBtn: {
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
