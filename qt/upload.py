#!/usr/local/bin/python3
# -*- coding: utf-8 -*-

"""
To run in bash:

chmod 755 upload.py
./upload.py

"""

import sys
from PyQt5.QtWidgets import QApplication, QWidget, QFileDialog, QLabel

class App(QWidget):

	def __init__(self):
		super().__init__()
		self.title = 'MERmaid'
		self.left = 10
		self.top = 10
		self.width = 640
		self.height = 480
		self.initUI()

	def openFileNamesDialog(self):	
		options = QFileDialog.Options()
		options |= QFileDialog.DontUseNativeDialog
		files, _ = QFileDialog.getOpenFileNames(self, "MERmaid - Upload Files", options=options)
		if files:
			print(files)
			return(files)

	def initUI(self):
		self.setWindowTitle(self.title)
		self.setGeometry(self.left, self.top, self.width, self.height)

		filenames = self.openFileNamesDialog()
		filenameText = QLabel(self)
		filenameText.setText('\n'.join(filenames))
		filenameText .move(20, 20)
		
		for filename in filenames:
			print(filename)
			text = open(filename).read()
			filecontentText = QLabel(self)
			filecontentText.setText(text)
			filecontentText.move(20, 60)
		
		self.show()


if __name__ == '__main__':
	app = QApplication(sys.argv)
	ex = App()
	sys.exit(app.exec_())
