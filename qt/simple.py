#!/usr/local/bin/python3
# -*- coding: utf-8 -*-

"""
To run in bash:

chmod 755 simple.py
./simple.py

"""

import sys
from PyQt5.QtWidgets import QApplication, QWidget, QLabel

def window():
    
    app = QApplication(sys.argv)
    
    w = QWidget()
    w.resize(250, 150)
    w.move(300, 300)
    w.setWindowTitle('Simple')

    b = QLabel(w)
    b.setText("Hello World!")
    w.setGeometry(100,100,200,50)
    b.move(50,20)
             
    w.show()
    
    sys.exit(app.exec_())

    
if __name__ == '__main__':
    window()
