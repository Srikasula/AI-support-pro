import argparse
from .rag import get_or_create_vectorstore
def main():
    p = argparse.ArgumentParser()
    p.add_argument("--path", required=True, help="File or folder to ingest")
    args = p.parse_args()
    vs = get_or_create_vectorstore()
    added = vs.add_path(args.path)
    print(f"Added {added} chunks from {args.path}")
if __name__ == "__main__":
    main()
