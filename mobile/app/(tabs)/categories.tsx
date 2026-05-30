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
import { useCategories, useCreateCategory, useDeleteCategory } from '../../src/hooks'
import type { Category } from '../../src/types'

export default function CategoriesScreen() {
  const [modalVisible, setModalVisible] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')

  const { data: categoriesData } = useCategories()
  const createCategory = useCreateCategory()
  const deleteCategory = useDeleteCategory()

  const incomeCategories = categoriesData?.categories?.filter((c: { type: string }) => c.type === 'income') || []
  const expenseCategories = categoriesData?.categories?.filter((c: { type: string }) => c.type === 'expense') || []

  const handleCreate = async () => {
    if (!name) {
      Alert.alert('Erro', 'Informe o nome da categoria')
      return
    }
    try {
      await createCategory.mutateAsync({ name, type })
      setModalVisible(false)
      setName('')
      Alert.alert('Sucesso', 'Categoria criada')
    } catch {
      Alert.alert('Erro', 'Erro ao criar categoria')
    }
  }

  const handleDelete = (id: number, isDefault: boolean) => {
    if (isDefault) {
      Alert.alert('Atenção', 'Não é possível excluir categorias padrão')
      return
    }
    Alert.alert('Excluir', 'Deseja excluir esta categoria?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCategory.mutateAsync(id)
          } catch {
            Alert.alert('Erro', 'Não é possível excluir categoria com transações')
          }
        },
      },
    ])
  }

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <Text style={styles.categoryName}>{item.name}</Text>
      {!item.is_default && (
        <TouchableOpacity onPress={() => handleDelete(item.id, item.is_default)}>
          <Ionicons name="trash-outline" size={18} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categorias</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receitas</Text>
          <FlatList
            data={incomeCategories}
            keyExtractor={(item) => `income-${item.id}`}
            renderItem={renderCategory}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma categoria</Text>}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Despesas</Text>
          <FlatList
            data={expenseCategories}
            keyExtractor={(item) => `expense-${item.id}`}
            renderItem={renderCategory}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma categoria</Text>}
          />
        </View>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Categoria</Text>
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
                placeholder="Nome da categoria"
              />

              <Text style={styles.label}>Tipo</Text>
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

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreate}
                disabled={createCategory.isPending}
              >
                <Text style={styles.submitButtonText}>Criar Categoria</Text>
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
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryName: {
    fontSize: 15,
    color: '#374151',
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
    maxHeight: '70%',
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
  typeToggle: {
    flexDirection: 'row',
    gap: 8,
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
