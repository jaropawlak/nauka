#! python
import os
import json
import shutil

# Funkcja do parsowania pojedynczego pliku .txt
def parse_txt_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.read().splitlines()

    # Sekcja pytań i odpowiedzi
    questions = []
    current_question = None
    current_answer = []

    for line in lines:  # Pomijamy nagłówki i potencjalną pustą linię
        if not line.strip():  # Pusty wiersz
            if current_question and current_answer:
                questions.append({
                    "question": current_question,
                    "answer": " ".join(current_answer)
                })
                current_question = None
                current_answer = []
        elif current_question is None:  # Nowe pytanie
            current_question = line.strip()
        else:  # Kontynuacja odpowiedzi
            current_answer.append(line.strip())

    # Dodanie ostatniego pytania
    if current_question and current_answer:
        questions.append({
            "question": current_question,
            "answer": " ".join(current_answer)
        })

    return questions
    

# Funkcja do tworzenia hierarchii folderów w index.json
def add_to_hierarchy(hierarchy, rel_path):
    parts = rel_path.split(os.sep)
    current_level = hierarchy

    for part in parts[:-1]:  # Iterujemy po folderach, pomijając plik
        if part not in current_level:
            current_level[part] = {}
        current_level = current_level[part]

    # Dodajemy plik do końcowego poziomu
    current_level[parts[-1]] = {
        "title": os.path.basename(rel_path).replace(".txt", ""),
        "file": rel_path.replace(".txt", ".json")
    }

# Funkcja do przetwarzania katalogu
def process_directory(directory, directory_output):
    index_hierarchy = {}

    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, directory)
            rel_dir = os.path.dirname(rel_path)
            output_path_with_rel = os.path.dirname(os.path.join(directory_output, rel_path))
            json_file_name = file.replace(".txt", ".json")
            json_file_path = os.path.join(output_path_with_rel, json_file_name)
            os.makedirs(output_path_with_rel, exist_ok=True)
            if file.endswith(".txt"):
                 # Parsowanie pliku
                data = parse_txt_file(file_path)
                with open(json_file_path, "w", encoding="utf-8") as json_file:
                    json.dump(data, json_file, ensure_ascii=False, indent=4)
            elif file.endswith(".json"):
                shutil.copy(file_path, json_file_path)
                # Dodanie danych do hierarchii
            add_to_hierarchy(index_hierarchy, rel_path)

    # Tworzenie pliku index.json
    index_file_path = os.path.join(directory_output, "index.json")
    with open(index_file_path, "w", encoding="utf-8") as index_file:
        json.dump(index_hierarchy, index_file, ensure_ascii=False, indent=4)

# Przykład użycia
# Zmień "ścieżka/do/katalogu" na katalog, który chcesz przetworzyć
directory_output = "../data/"
process_directory("../pytania/", directory_output)

