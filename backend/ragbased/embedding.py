from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

from .data_loader import load_pdf_documents


class EmbeddingPipeline:

    def __init__(
        self,
        model_name: str = "paraphrase-multilingual-MiniLM-L12-v2",
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ):

        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

        self.model = SentenceTransformer(model_name)

        print(
            f"[INFO] Loaded embedding model: {model_name}"
        )

    def chunk_documents(self, documents: list) -> list:

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )

        chunks = splitter.split_documents(documents)

        print(
            f"[INFO] Split {len(documents)} documents "
            f"into {len(chunks)} chunks."
        )

        return chunks

    def embed_chunks(self, chunks: list):

        texts = [
            chunk.page_content
            for chunk in chunks
        ]

        print(
            f"[INFO] Generating embeddings for "
            f"{len(texts)} chunks..."
        )

        embeddings = self.model.encode(
            texts,
            show_progress_bar=True,
            normalize_embeddings=True
        )

        print(
            f"[INFO] Embeddings shape: "
            f"{embeddings.shape}"
        )

        return embeddings



# TEST


if __name__ == "__main__":

    # Load PDF documents
    docs = load_pdf_documents()

    print(
        f"[INFO] Loaded {len(docs)} documents."
    )

    # Create embedding pipeline
    emb_pipe = EmbeddingPipeline()

    # Split documents into chunks
    chunks = emb_pipe.chunk_documents(docs)

    print(
        f"[INFO] Total chunks: {len(chunks)}"
    )

    # Generate embeddings
    embeddings = emb_pipe.embed_chunks(chunks)

    # Show first embedding
    print(
        "[INFO] Example embedding:",
        embeddings[0] if len(embeddings) > 0 else None
    )