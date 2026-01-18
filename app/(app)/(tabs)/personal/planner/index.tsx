import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { plannerApi } from "../../../../../src/api/personal";
import { useAuth } from "../../../../../src/auth/AuthContext";
import { COLORS } from "../../../../../src/utils/constants";

export default function PersonalPlannerScreen() {
  const { user } = useAuth();
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [dayPlan, setDayPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [newBlock, setNewBlock] = useState({
    start: "09:00",
    end: "10:00",
    title: "",
  });
  const [tasks, setTasks] = useState<any[]>([]);
  const saveTimeoutRef = useRef<any>(null);
  const [tasksModalOpen, setTasksModalOpen] = useState(false);

  useEffect(() => {
    // Only personal role users can access the planner
    if (user?.role !== "personal") {
      setLoading(false);
      return;
    }
    fetchPlan();
    fetchTasks();
  }, [date, user]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const plan = await plannerApi.getDayPlan(date);
      setDayPlan(plan || { blocks: [], notes: "" });
    } catch (err) {
      console.error("Failed to load day plan", err);
      setDayPlan({ blocks: [], notes: "" });
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const t = await (
        await import("../../../../../src/api/personal")
      ).personalTasksApi.getAll();
      setTasks(t || []);
    } catch (err) {
      console.error("Failed to load personal tasks", err);
    }
  };

  const handleAddBlock = () => {
    if (!newBlock.title.trim()) {
      Alert.alert("Validation", "Enter title");
      return;
    }
    // validate time format and start < end
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newBlock.start) || !timeRegex.test(newBlock.end)) {
      Alert.alert("Validation", "Use HH:mm time format (e.g. 09:30)");
      return;
    }
    const [sH, sM] = newBlock.start.split(":").map(Number);
    const [eH, eM] = newBlock.end.split(":").map(Number);
    const sMinutes = sH * 60 + sM;
    const eMinutes = eH * 60 + eM;
    if (sMinutes >= eMinutes) {
      Alert.alert("Validation", "End time must be after start time");
      return;
    }

    // check overlap
    const existing = dayPlan?.blocks || [];
    for (const b of existing) {
      const [bSH, bSM] = b.start.split(":").map(Number);
      const [bEH, bEM] = b.end.split(":").map(Number);
      const bS = bSH * 60 + bSM;
      const bE = bEH * 60 + bEM;
      if (sMinutes < bE && eMinutes > bS) {
        Alert.alert(
          "Validation",
          `Block overlaps with "${b.title || b.activity}" (${b.start} - ${
            b.end
          })`
        );
        return;
      }
    }

    const blocks = [
      ...(dayPlan?.blocks || []),
      {
        id: Date.now().toString(),
        ...newBlock,
        note: (newBlock as any).note || "",
        taskId: (newBlock as any).taskId || null,
        status: (newBlock as any).status || "planned",
        colorTag: (newBlock as any).colorTag || "none",
      },
    ];
    // sort blocks by start time
    blocks.sort((a: any, b: any) => {
      const [aH, aM] = a.start.split(":").map(Number);
      const [bH, bM] = b.start.split(":").map(Number);
      return aH * 60 + aM - (bH * 60 + bM);
    });
    setDayPlan({ ...(dayPlan || {}), blocks });
    debouncedSave(blocks);
    setModalOpen(false);
    setNewBlock({ start: "09:00", end: "10:00", title: "" });
  };
  const debouncedSave = (blocks: any[]) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaving(true);
    setSaveStatus("saving");
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await plannerApi.upsertDayPlan(date, blocks);
        setDayPlan(res);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(""), 1500);
      } catch (err) {
        // show detailed server error when available
        console.error("Failed to save blocks", err, err?.response?.data);
        const serverMessage =
          err?.response?.data?.message || err?.message || "Could not save plan";
        const serverDetails = err?.response?.data
          ? JSON.stringify(err.response.data)
          : null;
        Alert.alert(
          "Error saving plan",
          serverMessage + (serverDetails ? `\n\n${serverDetails}` : "")
        );
      } finally {
        setSaving(false);
      }
    }, 500);
  };

  const handleDelete = (id: string) => {
    const blocks = (dayPlan?.blocks || []).filter((b: any) => b.id !== id);
    setDayPlan({ ...(dayPlan || {}), blocks });
    debouncedSave(blocks);
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );

  // Deny access to non-personal role users
  if (user?.role !== "personal") {
    return (
      <View style={styles.center}>
        <Text
          style={{
            fontSize: 18,
            color: COLORS.text,
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          Access Restricted
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: COLORS.textSecondary,
            textAlign: "center",
            paddingHorizontal: 20,
          }}
        >
          Daily Planner is only available for personal workspace users
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Planner</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalOpen(true)}
          >
            <Text style={styles.addButtonText}>Add Block</Text>
          </TouchableOpacity>
          {saveStatus ? (
            <Text style={{ marginLeft: 10 }}>
              {saveStatus === "saving" ? "Saving..." : "Saved"}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.dateRow}>
        <TouchableOpacity
          onPress={() =>
            setDate((prev) => {
              const d = new Date(prev);
              d.setDate(d.getDate() - 1);
              return d.toISOString().split("T")[0];
            })
          }
        >
          <Text style={styles.navText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>{new Date(date).toDateString()}</Text>
        <TouchableOpacity
          onPress={() =>
            setDate((prev) => {
              const d = new Date(prev);
              d.setDate(d.getDate() + 1);
              return d.toISOString().split("T")[0];
            })
          }
        >
          <Text style={styles.navText}>▶</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dayPlan?.blocks || []}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <View style={styles.block}>
            <View style={{ flex: 1 }}>
              <Text style={styles.blockTime}>
                {item.start} — {item.end}
              </Text>
              <Text style={styles.blockActivity}>
                {item.title || item.activity}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No blocks for this day</Text>
          </View>
        }
      />

      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modal}>
            <Text style={styles.label}>Start</Text>
            <TextInput
              style={styles.input}
              value={newBlock.start}
              onChangeText={(t) => setNewBlock((b) => ({ ...b, start: t }))}
            />
            <Text style={styles.label}>End</Text>
            <TextInput
              style={styles.input}
              value={newBlock.end}
              onChangeText={(t) => setNewBlock((b) => ({ ...b, end: t }))}
            />
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={newBlock.title}
              onChangeText={(t) => setNewBlock((b) => ({ ...b, title: t }))}
            />
            <Text style={styles.label}>Note</Text>
            <TextInput
              style={styles.input}
              value={(newBlock as any).note || ""}
              onChangeText={(t) => setNewBlock((b) => ({ ...b, note: t }))}
            />

            <Text style={styles.label}>Link to Task (optional)</Text>
            <View
              style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
            >
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={(newBlock as any).taskId || ""}
                onChangeText={(t) => setNewBlock((b) => ({ ...b, taskId: t }))}
                placeholder="Paste task id or choose"
              />
              <TouchableOpacity
                style={[styles.addButton, { paddingHorizontal: 10 }]}
                onPress={() => setTasksModalOpen(true)}
              >
                <Text style={styles.addButtonText}>Choose</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalOpen(false)}
                style={styles.modalBtn}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddBlock}
                style={[styles.modalBtn, styles.modalBtnPrimary]}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Tasks picker modal */}
      <Modal visible={tasksModalOpen} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={[styles.modal, { maxHeight: "70%" }]}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                marginBottom: 8,
                color: COLORS.text,
              }}
            >
              Choose Task
            </Text>
            <FlatList
              data={tasks}
              keyExtractor={(t: any) => t._id}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.border,
                  }}
                  onPress={() => {
                    setNewBlock((b) => ({
                      ...b,
                      taskId: item._id,
                      title:
                        b.title && b.title.length > 0 ? b.title : item.title,
                    }));
                    setTasksModalOpen(false);
                  }}
                >
                  <Text style={{ fontWeight: "600", color: COLORS.text }}>
                    {item.title}
                  </Text>
                  {item.description ? (
                    <Text style={{ color: COLORS.textSecondary }}>
                      {item.description}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: 12 }}>
                  <Text style={{ color: COLORS.textSecondary }}>No tasks</Text>
                </View>
              }
            />
            <TouchableOpacity
              onPress={() => setTasksModalOpen(false)}
              style={[styles.modalBtn, { marginTop: 8 }]}
            >
              <Text>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  title: { fontSize: 20, fontWeight: "bold", color: COLORS.text },
  headerRight: {},
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "600" },
  dateRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "600",
    marginHorizontal: 12,
  },
  navText: { fontSize: 18, color: COLORS.text },
  block: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  blockTime: { fontSize: 12, color: COLORS.textSecondary },
  blockActivity: { fontSize: 16, color: COLORS.text, fontWeight: "600" },
  deleteBtn: { padding: 8 },
  deleteText: { color: COLORS.error },
  empty: { padding: 20, alignItems: "center" },
  emptyText: { color: COLORS.textSecondary },
  modalWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
  },
  label: { fontSize: 12, color: COLORS.textSecondary, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  modalBtn: {
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  modalBtnPrimary: { backgroundColor: COLORS.primary },
});
