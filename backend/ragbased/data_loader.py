from pathlib import Path
import pdfplumber

from langchain_core.documents import Document



# PATH


# Project root:
# AI-BASED-BIS-CHATBOT/
BASE_DIR = Path(__file__).resolve().parents[2]

# PDF directory:
# AI-BASED-BIS-CHATBOT/data/pdf/
PDF_DIR = BASE_DIR / "data" / "pdf"



# TABLE CLEANING


def clean_table(table):
    """
    Convert a pdfplumber table into readable text.
    """

    rows = []

    for row in table:

        cleaned_row = []

        for cell in row:

            if cell is None:
                cell = ""

            cell = str(cell).strip()
            cell = " ".join(cell.split())

            cleaned_row.append(cell)

        # Skip completely empty rows
        if any(cell for cell in cleaned_row):
            rows.append(" | ".join(cleaned_row))

    return "\n".join(rows)


# LOAD ONE PDF


def load_pdf(pdf_path):
    """
    Extract both normal text and tables from a PDF.

    Returns:
        list[Document]
    """

    documents = []

    print(f"\n[DEBUG] Loading PDF: {pdf_path}")

    with pdfplumber.open(pdf_path) as pdf:

        print(f"[DEBUG] Total pages: {len(pdf.pages)}")

        for page_number, page in enumerate(pdf.pages, start=1):

            
            # Extract normal text
          

            text = page.extract_text() or ""

            text = text.strip()

            
            # Extract tables
            

            tables = page.extract_tables()

            table_text = ""

            if tables:

                table_sections = []

                for table_number, table in enumerate(
                    tables,
                    start=1
                ):

                    cleaned = clean_table(table)

                    if cleaned:

                        table_sections.append(
                            f"TABLE {table_number}\n{cleaned}"
                        )

                table_text = "\n\n".join(table_sections)

         
            # Combine text + tables
     

            combined_text = ""

            if text:
                combined_text += text

            if table_text:

                if combined_text:
                    combined_text += "\n\n"

                combined_text += table_text

            
            # Create LangChain Document
          

            if combined_text:

                documents.append(
                    Document(
                        page_content=combined_text,
                        metadata={
                            "source": pdf_path.name,
                            "pdf_path": str(pdf_path),
                            "page": page_number,
                        },
                    )
                )

            print(
                f"[DEBUG] Page {page_number}: "
                f"text={'yes' if text else 'no'}, "
                f"tables={len(tables)}"
            )

    return documents



# LOAD ALL PDFs


def load_pdf_documents(data_path=PDF_DIR):

    data_path = Path(data_path)

    print(f"[DEBUG] Data path: {data_path}")

    pdf_files = list(data_path.glob("*.pdf"))

    print(f"[DEBUG] Found {len(pdf_files)} PDF files:")

    for pdf in pdf_files:
        print(f"    - {pdf.name}")

    all_documents = []

    for pdf_path in pdf_files:

        documents = load_pdf(pdf_path)

        all_documents.extend(documents)

    print(
        f"\n[DEBUG] Total loaded pages: "
        f"{len(all_documents)}"
    )

    return all_documents



# TEST


if __name__ == "__main__":

    documents = load_pdf_documents()

    print("\n======================================")
    print("LOADING COMPLETE")
    print("======================================")

    print(f"Loaded {len(documents)} page documents.")

    # --------------------------------------------------------
    # Show first document
    # --------------------------------------------------------

    if documents:

        print("\n======================================")
        print("FIRST DOCUMENT")
        print("======================================")

        print(documents[0].page_content)

        print("\n======================================")
        print("METADATA")
        print("======================================")

        print(documents[0].metadata)

    # --------------------------------------------------------
    # Find a document containing a table
    # --------------------------------------------------------

    print("\n======================================")
    print("FIRST TABLE FOUND")
    print("======================================")

    table_found = False

    for document in documents:

        if "TABLE 1" in document.page_content:

            print(
                f"\nSource: "
                f"{document.metadata['source']}"
            )

            print(
                f"Page: "
                f"{document.metadata['page']}"
            )

            print("\n")

            print(document.page_content)

            table_found = True

            break

    if not table_found:

        print("No table was found.")