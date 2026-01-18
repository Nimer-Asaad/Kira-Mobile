import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getErrorMessage } from "../../../../src/api/client";
import { personalTasksApi } from "../../../../src/api/personal";
import { tasksApi } from "../../../../src/api/tasks";
import { User } from "../../../../src/api/types";
import { usersApi } from "../../../../src/api/users";
import { useAuth } from "../../../../src/auth/AuthContext";
import { COLORS } from "../../../../src/utils/constants";

export default function CreateTaskScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    requiredAssigneesCount: "1",
  });
  const [checklist, setChecklist] = useState<{ text: string; done: boolean }[]>(
    []
  );
  const [newChecklistItem, setNewChecklistItem] = useState("");

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "hr") {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const data = await usersApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", getErrorMessage(error));
    }
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklist([
        ...checklist,
        { text: newChecklistItem.trim(), done: false },
      ]);
      setNewChecklistItem("");
    }
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert("Error", "Title and description are required");
      return;
    }

    if (!formData.dueDate) {
      Alert.alert("Error", "Due date is required");
      return;
    }

    setLoading(true);
    try {
      const isPersonal = Boolean(
        (user as any)?.workspaceMode === "personal" ||
          (user as any)?.mode === "personal" ||
          (user as any)?.role === "personal"
      );

      if (isPersonal) {
        // Create a personal task
        await personalTasksApi.create({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          dueDate: formData.dueDate,
          checklist: checklist.map((c) => ({ text: c.text, done: c.done })),
        } as any);
      } else {
        // Admin/HR create via tasks API
        await tasksApi.createTask({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          dueDate: formData.dueDate,
          assignedTo: selectedUserId || undefined,
          checklist: checklist.length > 0 ? checklist : undefined,
          requiredAssigneesCount:
            parseInt(formData.requiredAssigneesCount) || 1,
          ownerType: "employee",
        });
      }

      Alert.alert("Success", "Task created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Task</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Enter task title"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            placeholder="Enter task description"
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Priority */}
        <View style={styles.field}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.radioGroup}>
            {["low", "medium", "high"].map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.radioButton,
                  formData.priority === priority && styles.radioButtonSelected,
                ]}
                onPress={() => setFormData({ ...formData, priority })}
              >
                <Text
                  style={[
                    styles.radioButtonText,
                    formData.priority === priority &&
                      styles.radioButtonTextSelected,
                  ]}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Due Date *</Text>
          <TextInput
            style={styles.input}
            value={formData.dueDate}
            onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* Assign To (Admin/HR only) */}
        {(user?.role === "admin" || user?.role === "hr") && (
          <View style={styles.field}>
            <Text style={styles.label}>Assign To (Optional)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.usersList}
            >
              {users.map((u) => (
                <TouchableOpacity
                  key={u._id}
                  style={[
                    styles.userChip,
                    selectedUserId === u._id && styles.userChipSelected,
                  ]}
                  onPress={() =>
                    setSelectedUserId(selectedUserId === u._id ? null : u._id)
                  }
                >
                  <Text
                    style={[
                      styles.userChipText,
                      selectedUserId === u._id && styles.userChipTextSelected,
                    ]}
                  >
                    {u.fullName || u.name || "User"}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Checklist */}
        <View style={styles.field}>
          <Text style={styles.label}>Checklist</Text>
          <View style={styles.checklistInput}>
            <TextInput
              style={[styles.input, styles.checklistTextInput]}
              value={newChecklistItem}
              onChangeText={setNewChecklistItem}
              placeholder="Add checklist item"
              placeholderTextColor={COLORS.textSecondary}
              onSubmitEditing={handleAddChecklistItem}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddChecklistItem}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          {checklist.map((item, index) => (
            <View key={index} style={styles.checklistItem}>
              <Text style={styles.checklistItemText}>{item.text}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveChecklistItem(index)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    paddingTop: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  saveButton: {
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  radioGroup: {
    flexDirection: "row",
    gap: 12,
  },
  radioButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  radioButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  radioButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
  },
  radioButtonTextSelected: {
    color: "#fff",
  },
  usersList: {
    marginTop: 8,
  },
  userChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  userChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  userChipText: {
    fontSize: 14,
    color: COLORS.text,
  },
  userChipTextSelected: {
    color: "#fff",
  },
  checklistInput: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  checklistTextInput: {
    flex: 1,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checklistItemText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    fontSize: 20,
    color: COLORS.error,
    fontWeight: "bold",
  },
});
