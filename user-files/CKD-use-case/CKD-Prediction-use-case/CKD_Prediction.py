# Importing the required packages
import argparse
import numpy as np
import pandas as pd
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score
from sklearn.metrics import classification_report
import sys

if sys.version_info[0] < 3: 
    from StringIO import StringIO
else:
    from io import StringIO 


parser = argparse.ArgumentParser(description='')
parser.add_argument("dataset", help="preprosessed dataset file", type=str)
args = parser.parse_args()

# Function to split the dataset
def splitdataset(balance_data):
 
    # Seperating the target variable
    X = balance_data.values[:, 0:24]
    Y = balance_data.values[:, -1]
    
    # Spliting the dataset into train and test
    X_train, X_test, y_train, y_test = train_test_split( 
    X, Y, test_size = 0.3, random_state = 100)
     
    return X, Y, X_train, X_test, y_train, y_test
     
# Function to perform training with giniIndex.
def train_using_gini(X_train, X_test, y_train):
 
    # Creating the classifier object
    clf_gini = DecisionTreeClassifier(criterion = "gini",
            random_state = 100,max_depth=3, min_samples_leaf=5)
 
    # Performing training
    clf_gini.fit(X_train, y_train)
    return clf_gini
     
# Function to perform training with entropy.
def tarin_using_entropy(X_train, X_test, y_train):
 
    # Decision tree with entropy
    clf_entropy = DecisionTreeClassifier(criterion = "entropy", random_state = 100,
            max_depth = 3, min_samples_leaf = 5)
 
    # Performing training
    clf_entropy.fit(X_train, y_train)
    return clf_entropy
 
 
# Function to make predictions
def prediction(X_test, clf_object):
 
    y_pred = clf_object.predict(X_test)
    return y_pred
     
# Function to calculate accuracy
def cal_accuracy(y_test, y_pred):
     
    print("Confusion Matrix: \n",
    confusion_matrix(y_test,y_pred))
     
    print ("Accuracy : ",
    accuracy_score(y_test,y_pred)*100)
     
    print("Report : \n",
    classification_report(y_test, y_pred))
 
# Main code
def main():

    # Building Phase
    TESTDATA = StringIO(args.dataset)
    data = pd.read_csv(TESTDATA, sep= ',', header = 0)
    X, Y, X_train, X_test, y_train, y_test = splitdataset(data)
    
    clf_entropy = tarin_using_entropy(X_train, X_test, y_train)
     
    # Prediction using entropy
    y_pred_entropy = prediction(X_test, clf_entropy)
    print(y_pred_entropy)
     
     
# Calling main function
if __name__=="__main__":
    main()

