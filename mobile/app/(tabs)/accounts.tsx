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
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAccounts, useCreateAccount, useDeleteAccount } from '../../src/hooks'
import { formatCurrency, ACCOUNT_TYPE_LABELS } from '../../src/lib/utils'
import type { Account } from '../../src/types'

const ACCOUNT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  bank: 'business',
  cash: 'cash',
  credit_card: 'card',
  investment: 'trending-up',
  other: 'ellipsis-horizontal',
}

export default function AccountsScreen() {
  const [modalVisible, setModalVisible] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<string>('bank')
  const [initialBalance, setInitialBalance] = useState('')

  const { data: accountsData, isLoading } = useAccounts()
  const createAccount = useCreateAccount()
  const deleteAccount = useDeleteAccount()

  const handleCreate = async () => {
    if (!name) {
      Alert.alert('Erro', 'Informe o nome da conta')
      return
    }
    try {
      await createAccount.mutateAsync({
        name,
        type,
        initial_balance: initialBalance ? parseFloat(initialBalance) : undefined,
      })
      setModalVisible(false)
      setName('')
      setType('bank')
      setInitialBalance('')
      Alert.alert('Sucesso', 'Conta criada')
    } catch {
      Alert.alert('Erro', 'Erro ao criar conta')
    }
  }

  const handleDelete = (id: number) => {
    Alert.alert('Excluir', 'Deseja excluir esta conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount.mutateAsync(id)
          } catch {
            Alert.alert('Erro', 'Não é possível excluir conta com transações')
          }
        },
      },
    ])
  }

  const renderAccount = ({ item }: { item: Account }) => (
    <View style={styles.accountCard}>
      <View style={styles.accountHeader}>
        <View style={styles.accountIcon}>
          <Ionicons
            name={ACCOUNT_ICONS[item.type] || 'wallet'}
            size={24}
            color="#059669"
          />
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.accountName}>{item.name}</Text>
          <Text style={styles.accountType}>{ACCOUNT_TYPE_LABELS[item.type] || item.type}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
      <View style={styles.accountBalance}>
        <Text style={styles.balanceLabel}>Saldo</Text>
        <Text
          style={[
            styles.balanceValue,
            { color: parseFloat(item.current_balance) >= 0 ? '#059669' : '#dc2626' },
          ]}
        >
          {formatCurrency(item.current_balance)}
        </Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={accountsData?.accounts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderAccount}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>Nenhuma conta cadastrada</Text>
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
              <Text style={styles.modalTitle}>Nova Conta</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nome da conta"
              />

              <Text style={styles.label}>Tipo</Text>
              <View style={styles.typeGrid}>
                {Object.entries(ACCOUNT_TYPE_LABELS).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.typeOption,
                      type === key && styles.typeOptionSelected,
                    ]}
                    onPress={() => setType(key)}
                  >
                    <Ionicons
                      name={ACCOUNT_ICONS[key] as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={type === key ? '#059669' : '#9ca3af'}
                    />
                    <Text
                      style={[
                        styles.typeLabel,
                        type === key && styles.typeLabelSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Saldo Inicial (opcional)</Text>
              <TextInput
                style={styles.input}
                value={initialBalance}
                onChangeText={setInitialBalance}
                placeholder="0,00"
                keyboardType="decimal-pad"
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreate}
                disabled={createAccount.isPending}
              >
                <Text style={styles.submitButtonText}>Criar Conta</Text>
              </TouchableOpacity>
            </View>
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
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  accountType: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  accountBalance: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    width: '30%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    gap: 4,
  },
  typeOptionSelected: {
    borderColor: '#059669',
    backgroundColor: '#d1fae5',
  },
  typeLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  typeLabelSelected: {
    color: '#059669',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
