"""
데모용 초기 데이터 생성 스크립트
AI 논문 중 인용수가 많은 상위 5개 논문을 추가합니다.
"""
from database import SessionLocal, Paper, init_db
from datetime import datetime

# 데모 데이터: 실제 인기 AI 논문들
DEMO_PAPERS = [
    {
        "id": "arxiv_1706.03762",
        "arxiv_id": "1706.03762",
        "title": "Attention Is All You Need",
        "authors": ["Vaswani, A.", "Shazeer, N.", "Parmar, N.", "Uszkoreit, J.", "Jones, L.", "Gomez, A. N.", "Kaiser, L.", "Polosukhin, I."],
        "year": 2017,
        "venue": "NeurIPS",
        "tags": ["cs.CL", "cs.LG", "cs.AI"],
        "abstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show that these models are superior in quality while being more parallelizable and requiring significantly less time to train.",
        "pdf_url": "https://arxiv.org/pdf/1706.03762",
        "arxiv_url": "https://arxiv.org/abs/1706.03762",
        "published_date": datetime(2017, 6, 12),
        "updated_date": datetime(2017, 6, 12),
        "citations": 85000,
        "trending_score": 95.0,
        "recency_score": 60.0,
    },
    {
        "id": "arxiv_1810.04805",
        "arxiv_id": "1810.04805",
        "title": "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
        "authors": ["Devlin, J.", "Chang, M.-W.", "Lee, K.", "Toutanova, K."],
        "year": 2018,
        "venue": "NAACL",
        "tags": ["cs.CL", "cs.LG"],
        "abstract": "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers. As a result, the pre-trained BERT model can be fine-tuned with just one additional output layer to create state-of-the-art models for a wide range of tasks, such as question answering and language inference, without substantial task-specific architecture modifications.",
        "pdf_url": "https://arxiv.org/pdf/1810.04805",
        "arxiv_url": "https://arxiv.org/abs/1810.04805",
        "published_date": datetime(2018, 10, 11),
        "updated_date": datetime(2019, 5, 24),
        "citations": 65000,
        "trending_score": 88.0,
        "recency_score": 65.0,
    },
    {
        "id": "arxiv_2006.11239",
        "arxiv_id": "2006.11239",
        "title": "Denoising Diffusion Probabilistic Models",
        "authors": ["Ho, J.", "Jain, A.", "Abbeel, P."],
        "year": 2020,
        "venue": "NeurIPS",
        "tags": ["cs.CV", "cs.LG", "stat.ML"],
        "abstract": "We present high quality image synthesis results using diffusion probabilistic models, a class of latent variable models inspired by considerations from nonequilibrium thermodynamics. Our best results are obtained by training on a weighted variational bound designed according to a novel connection between diffusion probabilistic models and denoising score matching with Langevin dynamics, and our models naturally admit a progressive lossy decompression scheme that can be interpreted as a generalization of autoregressive decoding.",
        "pdf_url": "https://arxiv.org/pdf/2006.11239",
        "arxiv_url": "https://arxiv.org/abs/2006.11239",
        "published_date": datetime(2020, 6, 19),
        "updated_date": datetime(2020, 12, 16),
        "citations": 12000,
        "trending_score": 92.0,
        "recency_score": 75.0,
    },
    {
        "id": "arxiv_2010.11929",
        "arxiv_id": "2010.11929",
        "title": "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale",
        "authors": ["Dosovitskiy, A.", "Beyer, L.", "Kolesnikov, A.", "Weissenborn, D.", "Zhai, X.", "Unterthiner, T.", "Dehghani, M.", "Minderer, M.", "Heigold, G.", "Gelly, S.", "Uszkoreit, J.", "Houlsby, N."],
        "year": 2020,
        "venue": "ICLR",
        "tags": ["cs.CV", "cs.LG", "cs.AI"],
        "abstract": "While the Transformer architecture has become the de-facto standard for natural language processing tasks, its applications to computer vision remain limited. In vision, attention is either applied in conjunction with convolutional networks, or used to replace certain components of convolutional networks while keeping their overall structure in place. We show that this reliance on CNNs is not necessary and a pure transformer applied directly to sequences of image patches can perform very well on image classification tasks.",
        "pdf_url": "https://arxiv.org/pdf/2010.11929",
        "arxiv_url": "https://arxiv.org/abs/2010.11929",
        "published_date": datetime(2020, 10, 22),
        "updated_date": datetime(2021, 6, 2),
        "citations": 22000,
        "trending_score": 90.0,
        "recency_score": 80.0,
    },
    {
        "id": "arxiv_2303.08774",
        "arxiv_id": "2303.08774",
        "title": "GPT-4 Technical Report",
        "authors": ["OpenAI"],
        "year": 2023,
        "venue": "arXiv",
        "tags": ["cs.CL", "cs.AI", "cs.LG"],
        "abstract": "We report the development of GPT-4, a large-scale, multimodal model which can accept image and text inputs and produce text outputs. While less capable than humans in many real-world scenarios, GPT-4 exhibits human-level performance on various professional and academic benchmarks, including passing a simulated bar exam with a score around the top 10% of test takers. GPT-4 is a Transformer-based model pre-trained to predict the next token in a document. The post-training alignment process results in improved performance on measures of factuality and adherence to desired behavior.",
        "pdf_url": "https://arxiv.org/pdf/2303.08774",
        "arxiv_url": "https://arxiv.org/abs/2303.08774",
        "published_date": datetime(2023, 3, 15),
        "updated_date": datetime(2023, 3, 15),
        "citations": 8000,
        "trending_score": 98.0,
        "recency_score": 95.0,
    },
]


def init_demo_data():
    """데모 데이터 초기화"""
    print("데모 데이터 초기화 중...")
    
    # DB 초기화
    init_db()
    
    db = SessionLocal()
    try:
        for paper_data in DEMO_PAPERS:
            # 기존 논문 확인
            existing = db.query(Paper).filter(Paper.arxiv_id == paper_data["arxiv_id"]).first()
            
            if existing:
                print(f"  ✓ {paper_data['title'][:50]}... (이미 존재)")
                # 업데이트
                for key, value in paper_data.items():
                    if hasattr(existing, key):
                        setattr(existing, key, value)
            else:
                print(f"  + {paper_data['title'][:50]}... (추가)")
                paper = Paper(**paper_data)
                db.add(paper)
        
        db.commit()
        print(f"\n✅ 총 {len(DEMO_PAPERS)}개 데모 논문 초기화 완료")
        
    except Exception as e:
        print(f"❌ 오류: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_demo_data()
