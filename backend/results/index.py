import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для сохранения и получения результатов тестов пользователей"""
    
    method = event.get('httpMethod', 'GET')
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    # Подключение к БД
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'POST':
            # Сохранение результата теста
            data = json.loads(event.get('body', '{}'))
            username = data.get('username')
            test_type = data.get('test_type', 'detonator_simulator')
            score = data.get('score', 0)
            passed = data.get('passed', False)
            sequence_data = data.get('sequence_data', {})
            max_delay = data.get('max_delay', 0)
            
            if not username:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Username is required'})
                }
            
            # Найти или создать пользователя
            cursor.execute(
                "SELECT id FROM users WHERE username = %s",
                (username,)
            )
            user = cursor.fetchone()
            
            if not user:
                cursor.execute(
                    "INSERT INTO users (username, access_code) VALUES (%s, %s) RETURNING id",
                    (username, 'DEMO_CODE')
                )
                user_id = cursor.fetchone()['id']
            else:
                user_id = user['id']
            
            # Сохранить результат теста
            cursor.execute(
                """INSERT INTO test_results 
                   (user_id, test_type, score, passed, sequence_data, max_delay, completed_at) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s) 
                   RETURNING id""",
                (user_id, test_type, score, passed, json.dumps(sequence_data), max_delay, datetime.now())
            )
            result_id = cursor.fetchone()['id']
            
            # Обновить прогресс пользователя
            cursor.execute(
                """INSERT INTO user_progress (user_id, practice_completed, tests_completed, total_score)
                   VALUES (%s, 1, 1, %s)
                   ON CONFLICT (user_id) 
                   DO UPDATE SET 
                       practice_completed = user_progress.practice_completed + 1,
                       tests_completed = user_progress.tests_completed + 1,
                       total_score = user_progress.total_score + %s,
                       updated_at = %s""",
                (user_id, score, score, datetime.now())
            )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'result_id': result_id,
                    'user_id': user_id
                })
            }
        
        elif method == 'GET':
            # Получение результатов пользователя
            params = event.get('queryStringParameters', {})
            username = params.get('username')
            
            if not username:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Username is required'})
                }
            
            # Получить ID пользователя
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            
            if not user:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'results': [], 'progress': None})
                }
            
            user_id = user['id']
            
            # Получить последние 10 результатов
            cursor.execute(
                """SELECT id, test_type, score, passed, max_delay, completed_at 
                   FROM test_results 
                   WHERE user_id = %s 
                   ORDER BY completed_at DESC 
                   LIMIT 10""",
                (user_id,)
            )
            results = cursor.fetchall()
            
            # Получить прогресс
            cursor.execute(
                """SELECT theory_completed, practice_completed, tests_completed, total_score 
                   FROM user_progress 
                   WHERE user_id = %s""",
                (user_id,)
            )
            progress = cursor.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'results': [dict(r) for r in results] if results else [],
                    'progress': dict(progress) if progress else None
                }, default=str)
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        cursor.close()
        conn.close()
