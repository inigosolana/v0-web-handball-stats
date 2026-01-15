import os
import shutil
from roboflow import Roboflow
from ultralytics import YOLO

def setup():
    # Configuración
    api_key = "YMJkytcG8bzKKr5oZ8Bq"
    workspace_name = "uom-sgd5l" 
    
    print("Iniciando descarga del dataset desde Roboflow...")
    try:
        rf = Roboflow(api_key=api_key)
        project = rf.workspace(workspace_name).project("full-handball-dataset")
        dataset = project.version(1).download("yolov8")
        print("Dataset descargado correctamente.")
    except Exception as e:
        print(f"Error al descargar el dataset: {e}")
        return

    print("Iniciando entrenamiento del modelo YOLOv8n...")
    # Cargar modelo nano pre-entrenado
    model = YOLO("yolov8n.pt")
    
    # Entrenar
    # Se guardará en python/models/training_run
    results = model.train(
        data=f"{dataset.location}/data.yaml",
        epochs=50,
        imgsz=640,
        project="python/models",
        name="training_run",
        exist_ok=True # Sobrescribir si existe
    )
    
    # Mover el mejor modelo a python/models/best.pt
    source_path = os.path.join("python", "models", "training_run", "weights", "best.pt")
    dest_path = os.path.join("python", "models", "best.pt")
    
    if os.path.exists(source_path):
        # Crear directorio si no existe (aunque model.train lo crea)
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        
        if os.path.exists(dest_path):
            os.remove(dest_path)
            
        shutil.move(source_path, dest_path)
        print(f"Entrenamiento completado. Modelo guardado en: {dest_path}")
        
        # Opcional: Limpiar directorio de entrenamiento intermedio
        # shutil.rmtree(os.path.join("python", "models", "training_run"))
    else:
        print("El entrenamiento finalizó pero no se encontró el archivo best.pt")

if __name__ == "__main__":
    setup()
