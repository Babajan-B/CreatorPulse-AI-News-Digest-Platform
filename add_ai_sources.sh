#!/bin/bash

# Get auth token (you need to be logged in)
echo "🔐 Getting auth token..."

# Note: You need to replace with your actual login credentials or token
# For now, we'll add sources directly via API

BASE_URL="http://localhost:3000"

echo ""
echo "📱 Adding Top AI Twitter Personalities..."
echo ""

# Top AI Twitter Accounts
curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "twitter",
    "source_identifier": "@AndrewYNg",
    "source_name": "Andrew Ng",
    "priority_weight": 10
  }' | jq -r '.message // .error' && echo "✅ Added Andrew Ng"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "twitter",
    "source_identifier": "@ylecun",
    "source_name": "Yann LeCun (Meta AI)",
    "priority_weight": 10
  }' | jq -r '.message // .error' && echo "✅ Added Yann LeCun"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "twitter",
    "source_identifier": "@karpathy",
    "source_name": "Andrej Karpathy",
    "priority_weight": 10
  }' | jq -r '.message // .error' && echo "✅ Added Andrej Karpathy"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "twitter",
    "source_identifier": "@sama",
    "source_name": "Sam Altman (OpenAI)",
    "priority_weight": 10
  }' | jq -r '.message // .error' && echo "✅ Added Sam Altman"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "twitter",
    "source_identifier": "@demishassabis",
    "source_name": "Demis Hassabis (Google DeepMind)",
    "priority_weight": 10
  }' | jq -r '.message // .error' && echo "✅ Added Demis Hassabis"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "twitter",
    "source_identifier": "@GoodFellow_Ian",
    "source_name": "Ian Goodfellow (GANs)",
    "priority_weight": 9
  }' | jq -r '.message // .error' && echo "✅ Added Ian Goodfellow"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "twitter",
    "source_identifier": "@fchollet",
    "source_name": "François Chollet (Keras)",
    "priority_weight": 9
  }' | jq -r '.message // .error' && echo "✅ Added François Chollet"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "twitter",
    "source_identifier": "@elonmusk",
    "source_name": "Elon Musk (xAI, Tesla)",
    "priority_weight": 8
  }' | jq -r '.message // .error' && echo "✅ Added Elon Musk"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "twitter",
    "source_identifier": "@lexfridman",
    "source_name": "Lex Fridman",
    "priority_weight": 9
  }' | jq -r '.message // .error' && echo "✅ Added Lex Fridman"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "twitter",
    "source_identifier": "@hardmaru",
    "source_name": "David Ha (Stability AI)",
    "priority_weight": 8
  }' | jq -r '.message // .error' && echo "✅ Added David Ha"

echo ""
echo "📺 Adding Top AI YouTube Channels..."
echo ""

# Top AI YouTube Channels
curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "youtube",
    "source_identifier": "UCkw4JCwteGrDHIsyIIKo4tQ",
    "source_name": "Two Minute Papers",
    "priority_weight": 9
  }' | jq -r '.message // .error' && echo "✅ Added Two Minute Papers"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "youtube",
    "source_identifier": "UCYO_jab_esuFRV4b17AJtAw",
    "source_name": "3Blue1Brown",
    "priority_weight": 9
  }' | jq -r '.message // .error' && echo "✅ Added 3Blue1Brown"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "youtube",
    "source_identifier": "UCbfYPyITQ-7l4upoX8nvctg",
    "source_name": "Lex Fridman Podcast",
    "priority_weight": 9
  }' | jq -r '.message // .error' && echo "✅ Added Lex Fridman Podcast"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "youtube",
    "source_identifier": "UCBa5G_ESCn8Yd4vw5U-gIcg",
    "source_name": "Yannic Kilcher",
    "priority_weight": 8
  }' | jq -r '.message // .error' && echo "✅ Added Yannic Kilcher"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "youtube",
    "source_identifier": "UC8butISFwT-Wl7EV0hUK0BQ",
    "source_name": "freeCodeCamp.org",
    "priority_weight": 8
  }' | jq -r '.message // .error' && echo "✅ Added freeCodeCamp.org"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "youtube",
    "source_identifier": "UCZHmQk67mSJgfCCTn7xBfew",
    "source_name": "AI Explained",
    "priority_weight": 8
  }' | jq -r '.message // .error' && echo "✅ Added AI Explained"

echo ""
echo "📰 Adding Premium AI RSS Feeds..."
echo ""

# Premium AI RSS Feeds
curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "rss",
    "source_identifier": "https://www.deeplearning.ai/blog/rss/",
    "source_name": "DeepLearning.AI Blog",
    "priority_weight": 10
  }' | jq -r '.message // .error' && echo "✅ Added DeepLearning.AI"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "rss",
    "source_identifier": "https://openai.com/blog/rss.xml",
    "source_name": "OpenAI Blog",
    "priority_weight": 10
  }' | jq -r '.message // .error' && echo "✅ Added OpenAI Blog"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "rss",
    "source_identifier": "https://huggingface.co/blog/feed.xml",
    "source_name": "Hugging Face Blog",
    "priority_weight": 9
  }' | jq -r '.message // .error' && echo "✅ Added Hugging Face"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "rss",
    "source_identifier": "https://www.anthropic.com/rss.xml",
    "source_name": "Anthropic Blog",
    "priority_weight": 10
  }' | jq -r '.message // .error' && echo "✅ Added Anthropic"

curl -s "$BASE_URL/api/sources" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "rss",
    "source_identifier": "https://machinelearningmastery.com/feed/",
    "source_name": "Machine Learning Mastery",
    "priority_weight": 8
  }' | jq -r '.message // .error' && echo "✅ Added ML Mastery"

echo ""
echo "✅ Done! Added top AI sources."
echo "Visit http://localhost:3000/sources to see them!"
