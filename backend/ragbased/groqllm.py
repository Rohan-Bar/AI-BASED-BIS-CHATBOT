import os
import re

from dotenv import load_dotenv
from langchain_groq import ChatGroq

from ragbased.vector_store import ChromaVectorStore
from ragbased.data_loader import load_pdf_documents


# =============================================================
# LOAD ENVIRONMENT VARIABLES
# =============================================================

load_dotenv()


class RAGSearch:

    def __init__(
        self,
        persist_dir=None,
        collection_name: str = "rag_documents",
        embedding_model: str = "paraphrase-multilingual-MiniLM-L12-v2",
        llm_model: str = "openai/gpt-oss-20b"
    ):

       
        # CHROMA VECTOR STORE
        

        self.vectorstore = ChromaVectorStore(
            persist_dir=persist_dir,
            collection_name=collection_name,
            embedding_model=embedding_model
        )

        print(
            f"[INFO] Loaded embedding model: "
            f"{embedding_model}"
        )

      
        # CHECK CHROMADB
       

        count = self.vectorstore.collection.count()

        if count == 0:

            print("[INFO] ChromaDB is empty.")
            print("[INFO] Loading PDF documents...")

            docs = load_pdf_documents()

            print(
                f"[INFO] Loaded {len(docs)} document chunks."
            )

            self.vectorstore.build_from_documents(
                docs
            )

            print(
                f"[INFO] ChromaDB now contains "
                f"{self.vectorstore.collection.count()} vectors."
            )

        else:

            print(
                f"[INFO] ChromaDB already contains "
                f"{count} vectors."
            )

       
        # GROQ API KEY
        

        groq_api_key = os.getenv("GROQ_API_KEY")

        if not groq_api_key:

            raise ValueError(
                "GROQ_API_KEY not found. "
                "Please add GROQ_API_KEY to your .env file."
            )

    
        # GROQ LLM
     

        self.llm = ChatGroq(
            api_key=groq_api_key,
            model=llm_model,
            temperature=0,
            max_tokens=2048
        )

        print(
            f"[INFO] Groq LLM initialized: "
            f"{llm_model}"
        )

    
    # LANGUAGE DETECTION
   

    def detect_language(self, text: str) -> str:

        if not text:
            return "English"

        bengali_chars = len(
            re.findall(r'[\u0980-\u09FF]', text)
        )

        hindi_chars = len(
            re.findall(r'[\u0900-\u097F]', text)
        )

        english_chars = len(
            re.findall(r'[A-Za-z]', text)
        )

        if (
            bengali_chars > hindi_chars
            and bengali_chars > english_chars
        ):

            return "Bengali"

        if (
            hindi_chars > bengali_chars
            and hindi_chars > english_chars
        ):

            return "Hindi"

        return "English"

   
    # TRANSLATE QUERY FOR RETRIEVAL
   

    def translate_query_to_english(
        self,
        query: str,
        language: str
    ) -> str:

        
        # English does not need translation
        

        if language == "English":
            return query

        print(
            f"[INFO] Translating {language} query "
            f"to English for retrieval..."
        )

        translation_prompt = f"""
You are a query translation system for a BIS document
retrieval system.

Translate the user's question into clear, natural English
for semantic search.

The original question is written in {language}.

IMPORTANT RULES:

1. Translate ONLY the question.

2. DO NOT answer the question.

3. DO NOT explain the question.

4. DO NOT add any information.

5. Preserve the exact meaning of the original question.

6. Preserve technical terms where appropriate.

7. Preserve IS numbers exactly.

8. Preserve clause numbers exactly.

9. Preserve table numbers exactly.

10. Preserve form numbers exactly.

11. Preserve standard identifiers exactly.

12. Return ONLY the English translation.

ORIGINAL USER QUESTION:
{query}

ENGLISH RETRIEVAL QUERY:
"""

        try:

            response = self.llm.invoke(
                translation_prompt
            )

            translated_query = response.content.strip()

            if translated_query:

                print(
                    f"[INFO] English retrieval query: "
                    f"'{translated_query}'"
                )

                return translated_query

        except Exception as e:

            print(
                f"[WARNING] Query translation failed: {e}"
            )

        
        # FALLBACK
       

        print(
            "[WARNING] Using original query for retrieval."
        )

        return query

    
    # BUILD CONTEXT


    def _build_context(self, results):

        documents = results.get(
            "documents",
            [[]]
        )[0]

        metadatas = results.get(
            "metadatas",
            [[]]
        )[0]

        distances = results.get(
            "distances",
            [[]]
        )[0]

        if not documents:

            return "", []

        context_parts = []
        sources = []

        for i, document in enumerate(documents):

            source = "Unknown"
            page = "Unknown"
            distance = None

            if i < len(metadatas):

                metadata = metadatas[i]

                source = metadata.get(
                    "source",
                    "Unknown"
                )

                page = metadata.get(
                    "page",
                    "Unknown"
                )

            if i < len(distances):

                distance = distances[i]

            
            # CONTEXT
          

            context_parts.append(
                f"""
SOURCE: {source}
PAGE: {page}

CONTENT:
{document}
"""
            )

          
            # SOURCE INFORMATION
           

            sources.append(
                {
                    "source": source,
                    "page": page,
                    "distance": distance
                }
            )

        context = (
            "\n\n"
            "---------------------------------------------"
            "\n\n"
        ).join(context_parts)

        return context, sources

    
    # RAG SEARCH
   

    def search(
        self,
        query: str,
        top_k: int = 5
    ):

        print(
            f"\n[INFO] Processing query: '{query}'"
        )

       
        # LANGUAGE DETECTION
      

        language = self.detect_language(query)

        print(
            f"[INFO] Detected language: {language}"
        )

      
        # CREATE ENGLISH RETRIEVAL QUERY
        

        retrieval_query = self.translate_query_to_english(
            query=query,
            language=language
        )

        print(
            f"[INFO] Retrieval query: "
            f"'{retrieval_query}'"
        )

       
        # CHROMA SEARCH
    

        results = self.vectorstore.query(
            query_text=retrieval_query,
            top_k=top_k
        )

       
        # BUILD CONTEXT
    

        context, sources = self._build_context(
            results
        )

        
        # DEBUG INFORMATION
    

        print(
            f"[DEBUG] Retrieved documents: "
            f"{len(sources)}"
        )

        print(
            f"[DEBUG] Context length: "
            f"{len(context)} characters"
        )

        print(
            "\n[DEBUG] RETRIEVED DOCUMENTS"
        )

        print(
            "=============================================="
        )

        for i, source in enumerate(sources):

            print(
                f"\nDocument {i + 1}"
            )

            print(
                f"Source: {source['source']}"
            )

            print(
                f"Page: {source['page']}"
            )

            print(
                f"Distance: {source['distance']}"
            )

        print(
            "\n=============================================="
        )

        
        # NO CONTEXT
      

        if not context:

            return {
                "answer": self._no_information_message(
                    language
                ),
                "language": language,
                "sources": [],
                "found": False
            }

        
        # FINAL ANSWER PROMPT
   

        prompt = f"""
You are BIS Sahayak, an AI assistant for understanding
Bureau of Indian Standards (BIS) documents.

The user's original question is:

{query}

The required answer language is:

{language}

Answer the user's question using ONLY the retrieved
BIS document context below.

IMPORTANT RULES:

1. Use ONLY the provided BIS document context.

2. Do NOT use outside knowledge.

3. Do NOT invent information.

4. If the answer is present in the context, answer it directly.

5. If the answer is not present in the context, clearly say:
   "I could not find this information in the provided BIS documents."

6. Answer entirely in {language}.

7. If the retrieved documents are in English, translate
   the relevant information into {language}.

8. Do NOT mix languages.

9. Preserve IS numbers exactly.

10. Preserve clause numbers exactly.

11. Preserve table numbers exactly.

12. Preserve form numbers exactly.

13. Preserve standard identifiers exactly.

14. If there are multiple requirements, use numbered points.

15. Do not include unrelated information.

16. Do not repeat the same requirement.

17. Keep the answer concise and focused on the user's question.

18. Do not mention the retrieval process, embeddings,
    vector database, distance scores, or internal system details.

19. Do not guess if the context is insufficient.

20. Always return an answer.

=========================================================

RETRIEVED BIS DOCUMENT CONTEXT:

{context}

=========================================================

ANSWER:
"""

    
        # CALL LLM
        

        try:

            response = self.llm.invoke(
                prompt
            )

            answer = response.content

            if isinstance(answer, list):

                answer = " ".join(
                    str(item)
                    for item in answer
                )

            answer = str(answer).strip()

        except Exception as e:

            print(
                f"[ERROR] LLM generation failed: {e}"
            )

            return {
                "answer": self._no_information_message(
                    language
                ),
                "language": language,
                "sources": sources,
                "found": False
            }

       
        # EMPTY RESPONSE PROTECTION
      

        if not answer:

            print(
                "[WARNING] LLM returned an empty answer."
            )

            answer = self._no_information_message(
                language
            )

            return {
                "answer": answer,
                "language": language,
                "sources": sources,
                "found": False
            }

        # RETURN
       

        return {
            "answer": answer,
            "language": language,
            "sources": sources,
            "found": True
        }

   
    # NO INFORMATION MESSAGE
   

    def _no_information_message(
        self,
        language: str
    ):

        messages = {

            "English":
                "I could not find this information in the provided BIS documents.",

            "Hindi":
                "मुझे उपलब्ध BIS दस्तावेज़ों में यह जानकारी नहीं मिली।",

            "Bengali":
                "প্রদত্ত BIS নথিগুলিতে আমি এই তথ্য খুঁজে পাইনি।"
        }

        return messages.get(
            language,
            messages["English"]
        )

  
    # BACKWARD COMPATIBILITY
   

    def search_and_summarize(
        self,
        query: str,
        top_k: int = 5
    ) -> str:

        result = self.search(
            query=query,
            top_k=top_k
        )

        return result["answer"]



# TEST MULTILINGUAL RAG


if __name__ == "__main__":

    rag_search = RAGSearch()

    
    # TEST QUESTIONS
   

    questions = [

        (
            "ENGLISH",
            "What are the testing requirements?"
        ),

        (
            "HINDI",
            "परीक्षण की आवश्यकताएं क्या हैं?"
        ),

        (
            "BENGALI",
            "পরীক্ষার প্রয়োজনীয়তাগুলি কী কী?"
        ),

    ]

    
    # RUN TESTS
    

    for label, query in questions:

        print(
            "\n\n=============================================="
        )

        print(
            f"{label} QUESTION"
        )

        print(
            "=============================================="
        )

        result = rag_search.search(
            query=query,
            top_k=5
        )

        print(
            "\nDetected Language:"
        )

        print(
            result["language"]
        )

        print(
            "\nANSWER:"
        )

        print(
            "----------------------------------------------"
        )

        print(
            result["answer"]
        )

        print(
            "----------------------------------------------"
        )

        print(
            "\nSOURCES:"
        )

        for source in result["sources"]:

            print(
                source
            )