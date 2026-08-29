from pathlib import Path

import chromadb

from .embedding import EmbeddingPipeline


class ChromaVectorStore:

    def __init__(
        self,
        persist_dir=None,
        collection_name: str = "rag_documents",
        embedding_model: str = "paraphrase-multilingual-MiniLM-L12-v2",
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ):

       
        # PROJECT ROOT
        

        BASE_DIR = Path(__file__).resolve().parents[2]

   
        # CHROMA DIRECTORY
        

        if persist_dir is None:

            persist_dir = BASE_DIR / "data" / "vector_store"

        else:

            persist_dir = Path(persist_dir)

            if not persist_dir.is_absolute():

                persist_dir = BASE_DIR / persist_dir

        self.persist_dir = str(persist_dir)

        self.collection_name = collection_name

       
        # CHROMA CLIENT
       

        self.client = chromadb.PersistentClient(
            path=self.persist_dir
        )

       
        # COLLECTION
       

        self.collection = self.client.get_or_create_collection(
            name=self.collection_name
        )

     
        # MULTILINGUAL EMBEDDING PIPELINE
       

        self.emb_pipe = EmbeddingPipeline(
            model_name=embedding_model,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )

        print(
            f"[INFO] ChromaDB collection: "
            f"{self.collection_name}"
        )

        print(
            f"[INFO] ChromaDB path: "
            f"{self.persist_dir}"
        )

        print(
            f"[INFO] Existing vectors: "
            f"{self.collection.count()}"
        )

    
    # BUILD VECTOR STORE
   

    def build_from_documents(self, documents: list):

        print(
            f"[INFO] Building vector store from "
            f"{len(documents)} PDF documents..."
        )

        chunks = self.emb_pipe.chunk_documents(
            documents
        )

        print(
            f"[INFO] Total chunks: {len(chunks)}"
        )

        if not chunks:

            print(
                "[WARNING] No chunks found."
            )

            return

       
        # CREATE EMBEDDINGS
       

        embeddings = self.emb_pipe.embed_chunks(
            chunks
        )

       
        # DELETE OLD COLLECTION
       

        try:

            self.client.delete_collection(
                name=self.collection_name
            )

            print(
                "[INFO] Old collection deleted."
            )

        except Exception:

            pass

    
        # CREATE NEW COLLECTION
   

        self.collection = self.client.get_or_create_collection(
            name=self.collection_name
        )

       
        # PREPARE DATA
       

        ids = [
            f"chunk_{i}"
            for i in range(len(chunks))
        ]

        documents_text = [
            chunk.page_content
            for chunk in chunks
        ]

        metadatas = []

        for i, chunk in enumerate(chunks):

            metadata = {

                "chunk_id": i,

                "source": chunk.metadata.get(
                    "source",
                    "unknown"
                ),

                "page": chunk.metadata.get(
                    "page",
                    -1
                )
            }

            metadatas.append(
                metadata
            )


        # ADD TO CHROMADB
   

        self.collection.add(

            ids=ids,

            embeddings=embeddings.tolist(),

            documents=documents_text,

            metadatas=metadatas
        )

        print(
            f"[INFO] Added {len(chunks)} chunks "
            f"to ChromaDB."
        )

        print(
            f"[INFO] Total vectors: "
            f"{self.collection.count()}"
        )

    # QUERY VECTOR STORE
   

    def query(
        self,
        query_text: str,
        top_k: int = 5
    ):

        print(
            f"[INFO] Multilingual query: "
            f"'{query_text}'"
        )

   
        # CREATE QUERY EMBEDDING
        

        query_embedding = self.emb_pipe.model.encode(

            [query_text],

            normalize_embeddings=True
        )

       
        # SEARCH CHROMADB
        

        results = self.collection.query(

            query_embeddings=query_embedding.tolist(),

            n_results=top_k
        )

        return results



# TEST VECTOR STORE


if __name__ == "__main__":

    from .data_loader import load_pdf_documents

    docs = load_pdf_documents()

    print(
        f"[INFO] Loaded {len(docs)} PDF documents."
    )

    store = ChromaVectorStore()

    # IMPORTANT:
    # Because the embedding model changed,
    # rebuild the existing Chroma database.

    if store.collection.count() == 0:

        print(
            "[INFO] ChromaDB is empty."
        )

        store.build_from_documents(
            docs
        )

    else:

        print(
            f"[INFO] ChromaDB already contains "
            f"{store.collection.count()} vectors."
        )

        print(
            "[INFO] Skipping rebuild."
        )

  
    # TEST ENGLISH
    

    print("\n==============================")
    print("ENGLISH TEST")
    print("==============================")

    results = store.query(

        "What are the testing requirements?",

        top_k=3
    )

    for i in range(
        len(results["documents"][0])
    ):

        print(
            f"\n--- Result {i + 1} ---"
        )

        print(
            results["documents"][0][i][:500]
        )

        print(
            "Metadata:",
            results["metadatas"][0][i]
        )

   
    # TEST HINDI
    

    print("\n==============================")
    print("HINDI TEST")
    print("==============================")

    results = store.query(

        "परीक्षण की आवश्यकताएं क्या हैं?",

        top_k=3
    )

    for i in range(
        len(results["documents"][0])
    ):

        print(
            f"\n--- Result {i + 1} ---"
        )

        print(
            results["documents"][0][i][:500]
        )

        print(
            "Metadata:",
            results["metadatas"][0][i]
        )

   
    # TEST BENGALI
    

    print("\n==============================")
    print("BENGALI TEST")
    print("==============================")

    results = store.query(

        "পরীক্ষার প্রয়োজনীয়তাগুলি কী কী?",

        top_k=3
    )

    for i in range(
        len(results["documents"][0])
    ):

        print(
            f"\n--- Result {i + 1} ---"
        )

        print(
            results["documents"][0][i][:500]
        )

        print(
            "Metadata:",
            results["metadatas"][0][i]
        )