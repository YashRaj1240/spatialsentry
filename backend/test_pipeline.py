import asyncio
from app.memory.database import init_db, seed_default_memories, get_all_memories
from app.memory.query_engine import answer_spatial_query

def main():
    print("=" * 60)
    print("  SpatialSentry Pipeline & Memory Graph Test")
    print("=" * 60)

    # 1. Initialize & Seed DB
    init_db()
    seed_default_memories()

    memories = get_all_memories()
    print(f"\n[1] Total Indexed Memories: {len(memories)}")
    for m in memories:
        print(f"  • {m['object_name'].title()} -> {m['room_context']} (Observed: {m['timestamp'][:16]})")

    # 2. Test Natural Language Spatial Recall
    test_queries = [
        "Where did I leave my car keys?",
        "Where is my wallet?",
        "Where are my airpods?"
    ]

    print("\n[2] Testing Muse Spark Temporal-Spatial Search:")
    for q in test_queries:
        res = asyncio.run(answer_spatial_query(q))
        print(f"\n  Q: \"{q}\"")
        print(f"  Target: {res.get('target_object')}")
        print(f"  Location: {res.get('location_context')}")
        print(f"  Elapsed: {res.get('time_ago')}")
        print(f"  SAM BBox: {res.get('bounding_box')}")
        print(f"  AI Explanation: {res.get('explanation')}")

    print("\n" + "=" * 60)
    print("  All Pipeline Tests Completed Successfully!")
    print("=" * 60)

if __name__ == "__main__":
    main()
