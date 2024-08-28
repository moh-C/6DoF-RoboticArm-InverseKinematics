FROM tensorflow/tensorflow:2.10.1-gpu-jupyter

WORKDIR /tf/workdir

# Install additional packages
RUN pip install --no-cache-dir mlflow seaborn pandas plotly tqdm

# Expose port 8888 for Jupyter Notebook
EXPOSE 8888

# Set the default command to run Jupyter Notebook
CMD ["jupyter", "notebook", "--ip=0.0.0.0", "--port=8888", "--no-browser", "--allow-root"]