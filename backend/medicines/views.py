from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Medicine
from .serializers import MedicineSerializer

@api_view(['GET', 'POST'])
def medicine_list(request):
    if request.method == 'GET':
        medicines = Medicine.objects.filter(user=request.user)
        serializer = MedicineSerializer(medicines, many=True)
        return Response({
            'medicines': serializer.data
        }, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = MedicineSerializer(data=request.data)
        if serializer.is_valid():
            medicine = serializer.save(user=request.user)
            return Response({
                'message': 'Medicine added successfully',
                'medicine': MedicineSerializer(medicine).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def medicine_detail(request, pk):
    try:
        medicine = Medicine.objects.get(pk=pk, user=request.user)
    except Medicine.DoesNotExist:
        return Response({'error': 'Medicine not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = MedicineSerializer(medicine)
        return Response({
            'medicine': serializer.data
        }, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        serializer = MedicineSerializer(medicine, data=request.data)
        if serializer.is_valid():
            medicine = serializer.save()
            return Response({
                'message': 'Medicine updated successfully',
                'medicine': MedicineSerializer(medicine).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        medicine.delete()
        return Response({
            'message': 'Medicine deleted successfully'
        }, status=status.HTTP_200_OK)
