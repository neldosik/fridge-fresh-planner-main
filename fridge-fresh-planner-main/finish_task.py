import os

path = "C:\\Users\\Oleksandr\\.gemini\\antigravity\\brain\\057cbef0-b7f2-4999-a479-10aa712a6cdb\\task.md"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('- [ ] Translate AI Assistant fallback messages', '- [x] Translate AI Assistant fallback messages')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Task list fully completed.")
