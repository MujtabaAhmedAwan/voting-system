import pypdf

reader = pypdf.PdfReader("Voting List Full 2023.pdf")
text = ""
for i in range(min(3, len(reader.pages))):
    page = reader.pages[i]
    text += f"--- PAGE {i+1} ---\n"
    text += page.extract_text() + "\n"

with open("pdf_sample.txt", "w", encoding="utf-8") as f:
    f.write(text)

print("Extracted first 3 pages to pdf_sample.txt")
