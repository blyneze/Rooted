import React, { useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "@/components/ui/Typography";
import { EmptyState } from "@/components/ui/EmptyState";
import { useBibleStore } from "@/store/bibleStore";
import { useAudioStore } from "@/store/audioStore";
import {
  BIBLE_BOOKS,
  OLD_TESTAMENT,
  NEW_TESTAMENT,
} from "@/constants/bibleData";
import { useBibleChapter } from "@/api/queries";
import theme from "@/theme";
import type {
  BibleVerse,
  BibleChapter,
  BibleBook,
  HighlightColor,
} from "@/types";

const HIGHLIGHT_COLORS: { color: HighlightColor; hex: string }[] = [
  { color: "yellow", hex: "#FFD60A" },
  { color: "red", hex: "#FF3B30" },
  { color: "green", hex: "#34C759" },
  { color: "blue", hex: "#0A84FF" },
  { color: "purple", hex: "#AF52DE" },
];

// ── Verse action panel (appears below a tapped verse) ───────────────────────

function VerseActionPanel({
  verse,
  onClose,
}: {
  verse: BibleVerse;
  onClose: () => void;
}) {
  const {
    addHighlight,
    removeHighlight,
    getHighlightForVerse,
    addBookmark,
    isBookmarked,
    addNote,
  } = useBibleStore();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState("");
  const existing = getHighlightForVerse(verse.reference);
  const bookmarked = isBookmarked(verse.reference);

  const handleHighlight = (color: HighlightColor) => {
    if (existing?.color === color) {
      removeHighlight(verse.reference);
    } else {
      addHighlight({
        verseReference: verse.reference,
        bookId: verse.bookId,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
        color,
      });
    }
    onClose();
  };

  const handleBookmark = () => {
    if (bookmarked) return;
    addBookmark({
      verseReference: verse.reference,
      bookId: verse.bookId,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text,
    });
    onClose();
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    addNote({
      verseReference: verse.reference,
      bookId: verse.bookId,
      chapter: verse.chapter,
      verse: verse.verse,
      verseText: verse.text,
      content: noteText.trim(),
    });
    setNoteText("");
    setShowNoteInput(false);
    onClose();
  };

  return (
    <View style={panelStyles.floatingWrapper}>
      <View style={panelStyles.container}>
        <View style={panelStyles.header}>
          <Typography variant="overline" color="accent" style={panelStyles.headerRef}>
            {verse.displayReference || verse.reference}
          </Typography>
          <TouchableOpacity onPress={onClose} style={panelStyles.closeBtn}>
            <Ionicons name="close" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Highlight colors */}
        <View style={panelStyles.scrollableColors}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={panelStyles.colorRow}>
            {HIGHLIGHT_COLORS.map(({ color, hex }) => (
              <TouchableOpacity
                key={color}
                style={[
                  panelStyles.colorCircle,
                  { backgroundColor: hex },
                  existing?.color === color && panelStyles.colorCircleActive,
                ]}
                onPress={() => handleHighlight(color)}
              >
                {existing?.color === color && (
                  <View style={panelStyles.activeIndicator} />
                )}
              </TouchableOpacity>
            ))}
            {existing && (
              <TouchableOpacity
                style={panelStyles.clearHighlight}
                onPress={() => {
                  removeHighlight(verse.reference);
                  onClose();
                }}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.colors.textTertiary}
                />
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Actions row */}
        <View style={panelStyles.actionsRow}>
          <TouchableOpacity
            style={[panelStyles.actionBtn, showNoteInput && panelStyles.actionBtnActive]}
            onPress={() => setShowNoteInput(!showNoteInput)}
          >
            <Ionicons
              name={showNoteInput ? "create" : "create-outline"}
              size={20}
              color={showNoteInput ? theme.colors.accent : theme.colors.textSecondary}
            />
            <Typography variant="caption" color={showNoteInput ? "accent" : "secondary"}>
              Note
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[panelStyles.actionBtn, bookmarked && panelStyles.actionBtnActive]}
            onPress={handleBookmark}
          >
            <Ionicons
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={20}
              color={bookmarked ? theme.colors.accent : theme.colors.textSecondary}
            />
            <Typography variant="caption" color={bookmarked ? "accent" : "secondary"}>
              Bookmark
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity style={panelStyles.actionBtn} onPress={() => {}}>
            <Ionicons name="share-outline" size={20} color={theme.colors.textSecondary} />
            <Typography variant="caption" color="secondary">
              Share
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Note input */}
        {showNoteInput && (
          <View style={panelStyles.noteInputArea}>
            <TextInput
              style={panelStyles.noteInput}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Add your reflections..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              autoFocus
              selectionColor={theme.colors.accent}
            />
            <TouchableOpacity
              style={panelStyles.noteSave}
              onPress={handleSaveNote}
            >
              <Typography variant="label" color="inverse">
                Save Note
              </Typography>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const panelStyles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    left: theme.spacing.base,
    right: theme.spacing.base,
    zIndex: 100,
  },
  container: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.base,
    ...theme.shadow.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceMid,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerRef: {
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 4,
  },
  scrollableColors: {
    marginBottom: theme.spacing.lg,
  },
  colorRow: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingRight: theme.spacing.base,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleActive: {
    borderColor: theme.colors.accent,
    transform: [{ scale: 1.1 }],
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  clearHighlight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: theme.radius.md,
  },
  actionBtnActive: {
    backgroundColor: theme.colors.accentMuted,
  },
  noteInputArea: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  noteInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceMid,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.base,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  noteSave: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.full,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ── Book Selector Modal ───────────────────────────────────────────────────────

function BookSelectorModal({
  visible,
  onSelect,
  onClose,
}: {
  visible: boolean;
  onSelect: (book: BibleBook) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={bookModalStyles.container}>
        <View style={bookModalStyles.header}>
          <Typography variant="heading3">Select Book</Typography>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons
              name="close"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Typography
            variant="overline"
            color="tertiary"
            style={bookModalStyles.testament}
          >
            Old Testament
          </Typography>
          {OLD_TESTAMENT.map((book) => (
            <TouchableOpacity
              key={book.id}
              style={bookModalStyles.bookItem}
              onPress={() => {
                onSelect(book);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Typography variant="body">{book.name}</Typography>
              <Typography variant="caption" color="tertiary">
                {book.chapterCount} chapters
              </Typography>
            </TouchableOpacity>
          ))}
          <Typography
            variant="overline"
            color="tertiary"
            style={bookModalStyles.testament}
          >
            New Testament
          </Typography>
          {NEW_TESTAMENT.map((book) => (
            <TouchableOpacity
              key={book.id}
              style={bookModalStyles.bookItem}
              onPress={() => {
                onSelect(book);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Typography variant="body">{book.name}</Typography>
              <Typography variant="caption" color="tertiary">
                {book.chapterCount} chapters
              </Typography>
            </TouchableOpacity>
          ))}
          <View style={{ height: 48 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const bookModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.base,
    paddingBottom: theme.spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
  },
  testament: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
  },
});

// ── Chapter Selector ─────────────────────────────────────────────────────────

function ChapterSelector({
  book,
  currentChapter,
  onSelect,
}: {
  book: BibleBook;
  currentChapter: number;
  onSelect: (chapter: number) => void;
}) {
  const chapters = Array.from({ length: book.chapterCount }, (_, i) => i + 1);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={chapterStyles.scroll}
    >
      {chapters.map((ch) => (
        <TouchableOpacity
          key={ch}
          style={[
            chapterStyles.chip,
            currentChapter === ch && chapterStyles.chipActive,
          ]}
          onPress={() => onSelect(ch)}
        >
          <Typography
            variant="label"
            style={{
              color:
                currentChapter === ch
                  ? theme.colors.accent
                  : theme.colors.textSecondary,
            }}
          >
            {ch}
          </Typography>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const chapterStyles = StyleSheet.create({
  scroll: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.sm,
    paddingBottom: 4,
    gap: 6,
  },
  chip: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    backgroundColor: theme.colors.accentMuted,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
});

// ── Verse Item ────────────────────────────────────────────────────────────────

function VerseItem({
  verse,
  fontSize,
  isSelected,
  highlight,
  hasNote,
  onPress,
}: {
  verse: BibleVerse;
  fontSize: number;
  isSelected: boolean;
  highlight?: { color: HighlightColor };
  hasNote: boolean;
  onPress: () => void;
}) {
  const bgColor = highlight
    ? theme.colors.highlight[highlight.color]
    : isSelected
      ? theme.colors.accentMuted
      : "transparent";

  return (
    <TouchableOpacity
      style={[verseStyles.container, { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Typography variant="caption" color="accent" style={verseStyles.verseNum}>
        {verse.verse}
      </Typography>
      <View style={verseStyles.textWrap}>
        <Typography
          style={[
            verseStyles.verseText,
            { fontSize, lineHeight: fontSize * 1.7 },
          ]}
        >
          {verse.text}
        </Typography>
        {hasNote && (
          <View style={verseStyles.noteIndicator}>
            <Ionicons name="create" size={11} color={theme.colors.accent} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const verseStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 8,
    gap: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  verseNum: {
    minWidth: 22,
    marginTop: 3,
  },
  textWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  verseText: {
    color: theme.colors.textPrimary,
    flex: 1,
  },
  noteIndicator: {
    marginLeft: 6,
    marginTop: 4,
  },
});

// ── Main Bible Screen ─────────────────────────────────────────────────────────

export default function BibleScreen() {
  const {
    readingPosition,
    setReadingPosition,
    fontSize,
    setFontSize,
    getHighlightForVerse,
    getNoteForVerse,
  } = useBibleStore();

  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const { notes, highlights } = useBibleStore();

  const { data: chapterData, isLoading } = useBibleChapter(
    readingPosition.bookId,
    readingPosition.chapter.toString(),
  );

  const currentBook = BIBLE_BOOKS.find((b) => b.id === readingPosition.bookId);

  const handleSelectBook = (book: BibleBook) => {
    setReadingPosition({ bookId: book.id, bookName: book.name, chapter: 1 });
    setSelectedVerse(null);
  };

  const handleSelectChapter = (chapter: number) => {
    setReadingPosition({ ...readingPosition, chapter });
    setSelectedVerse(null);
  };

  const handlePrevChapter = () => {
    if (readingPosition.chapter <= 1) return;
    handleSelectChapter(readingPosition.chapter - 1);
  };

  const handleNextChapter = () => {
    if (!currentBook || readingPosition.chapter >= currentBook.chapterCount)
      return;
    handleSelectChapter(readingPosition.chapter + 1);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Top Navigation ─────────────────────────────────────────────────── */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.bookChapterBtn}
          onPress={() => setShowBookSelector(true)}
        >
          <Typography variant="title">
            {readingPosition.bookName} {readingPosition.chapter}
          </Typography>
          <Ionicons
            name="chevron-down"
            size={16}
            color={theme.colors.textSecondary}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
        <View style={styles.topNavActions}>
          {/* Font size */}
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setFontSize(Math.max(13, fontSize - 1))}
            hitSlop={8}
          >
            <Typography
              variant="bodySmall"
              color="tertiary"
              style={{ fontSize: 13 }}
            >
              A
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setFontSize(Math.min(24, fontSize + 1))}
            hitSlop={8}
          >
            <Typography
              variant="body"
              style={{ fontSize: 20 }}
              color="tertiary"
            >
              A
            </Typography>
          </TouchableOpacity>
          {/* Notes */}
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setShowNotes(true)}
            hitSlop={8}
          >
            <Ionicons
              name="bookmarks-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.readerContainer}>
        {/* ── Verse list ─────────────────────────────────────────────────── */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        ) : chapterData?.verses?.length ? (
          <FlatList
            data={chapterData.verses}
            keyExtractor={(item) => item.reference}
            contentContainerStyle={styles.verseList}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={{ backgroundColor: theme.colors.background }}>
                {currentBook && (
                  <ChapterSelector
                    book={currentBook}
                    currentChapter={readingPosition.chapter}
                    onSelect={handleSelectChapter}
                  />
                )}
                <View style={styles.headerWrap} />
              </View>
            }
            stickyHeaderIndices={[0]}
            renderItem={({ item }) => (
              <VerseItem
                verse={item}
                fontSize={fontSize}
                isSelected={selectedVerse?.reference === item.reference}
                highlight={getHighlightForVerse(item.reference)}
                hasNote={!!getNoteForVerse(item.reference)}
                onPress={() =>
                  setSelectedVerse(
                    selectedVerse?.reference === item.reference ? null : item,
                  )
                }
              />
            )}
            ListFooterComponent={
              <View style={styles.chapterNav}>
                <TouchableOpacity
                  style={[
                    styles.chapterNavBtn,
                    readingPosition.chapter <= 1 &&
                      styles.chapterNavBtnDisabled,
                  ]}
                  onPress={handlePrevChapter}
                  disabled={readingPosition.chapter <= 1}
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={
                      readingPosition.chapter <= 1
                        ? theme.colors.textTertiary
                        : theme.colors.textPrimary
                    }
                  />
                  <Typography
                    variant="label"
                    color={
                      readingPosition.chapter <= 1 ? "tertiary" : "primary"
                    }
                  >
                    Previous
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.chapterNavBtn,
                    (!currentBook ||
                      readingPosition.chapter >= currentBook.chapterCount) &&
                      styles.chapterNavBtnDisabled,
                  ]}
                  onPress={handleNextChapter}
                  disabled={
                    !currentBook ||
                    readingPosition.chapter >= currentBook.chapterCount
                  }
                >
                  <Typography
                    variant="label"
                    color={
                      !currentBook ||
                      readingPosition.chapter >= currentBook.chapterCount
                        ? "tertiary"
                        : "primary"
                    }
                  >
                    Next
                  </Typography>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={
                      !currentBook ||
                      readingPosition.chapter >= currentBook.chapterCount
                        ? theme.colors.textTertiary
                        : theme.colors.textPrimary
                    }
                  />
                </TouchableOpacity>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="book-outline"
              title={`${readingPosition.bookName} ${readingPosition.chapter}`}
              description="This chapter is currently unavailable. Please try another or check your connection."
            />
          </View>
        )}

        {/* ── Verse action panel ─────────────────────────────────────────── */}
        {selectedVerse && (
          <VerseActionPanel
            verse={selectedVerse}
            onClose={() => setSelectedVerse(null)}
          />
        )}
      </View>

      {/* ── Book selector modal ───────────────────────────────────────────── */}
      <BookSelectorModal
        visible={showBookSelector}
        onSelect={handleSelectBook}
        onClose={() => setShowBookSelector(false)}
      />

      {/* ── Notes & Highlights Panel ─────────────────────────────────────── */}
      <Modal
        visible={showNotes}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={notesStyles.container} edges={["top"]}>
          <View style={notesStyles.header}>
            <Typography variant="heading3">Study Notes</Typography>
            <TouchableOpacity onPress={() => setShowNotes(false)} hitSlop={12}>
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Highlights */}
            <Typography
              variant="overline"
              color="tertiary"
              style={notesStyles.section}
            >
              Highlights ({highlights.length})
            </Typography>
            {highlights.map((hl) => (
              <View key={hl.id} style={notesStyles.noteCard}>
                <View
                  style={[
                    notesStyles.highlightBar,
                    { backgroundColor: theme.colors.highlight[hl.color] },
                  ]}
                />
                <View style={notesStyles.noteContent}>
                  <Typography
                    variant="overline"
                    color="accent"
                    style={{ marginBottom: 4 }}
                  >
                    {hl.verseReference}
                  </Typography>
                  <Typography
                    variant="bodySmall"
                    color="secondary"
                    numberOfLines={3}
                  >
                    {hl.text}
                  </Typography>
                </View>
              </View>
            ))}
            {/* Notes */}
            <Typography
              variant="overline"
              color="tertiary"
              style={notesStyles.section}
            >
              Notes ({notes.length})
            </Typography>
            {notes.map((note) => (
              <View key={note.id} style={notesStyles.noteCard}>
                <View
                  style={[
                    notesStyles.highlightBar,
                    { backgroundColor: theme.colors.accent },
                  ]}
                />
                <View style={notesStyles.noteContent}>
                  <Typography
                    variant="overline"
                    color="accent"
                    style={{ marginBottom: 4 }}
                  >
                    {note.verseReference}
                  </Typography>
                  <Typography
                    variant="bodySmall"
                    color="secondary"
                    style={{ marginBottom: 6 }}
                    numberOfLines={2}
                  >
                    {note.verseText}
                  </Typography>
                  <Typography variant="body">{note.content}</Typography>
                </View>
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const notesStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
  },
  section: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },
  noteCard: {
    flexDirection: "row",
    marginHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  highlightBar: {
    width: 4,
  },
  noteContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceMid,
  },
  bookChapterBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  topNavActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  readerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 60,
  },
  verseList: {
    paddingBottom: 80,
  },
  headerWrap: {
    height: 12,
  },
  chapterHeading: {
    paddingHorizontal: theme.spacing.base,
    color: theme.colors.textPrimary,
  },
  chapterNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.xl,
    marginTop: theme.spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.surfaceMid,
  },
  chapterNavBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
  },
  chapterNavBtnDisabled: {
    opacity: 0.35,
  },
});
