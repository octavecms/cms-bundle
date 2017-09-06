<?php

namespace VideInfra\CMSBundle\Form\Type;

use A2lix\TranslationFormBundle\Form\Type\TranslationsType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\CallbackTransformer;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use VideInfra\CMSBundle\Model\MediaGalleryItem;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaGalleryItemType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('galleryorder', HiddenType::class)
            ->add('image', MediaImageType::class)
            ->add('translations', TranslationsType::class, [
                'locales' => ['en'],
                'label' => false,
                'fields' => [
                    'title' => ['label' => 'Caption']
                ]
            ])
            ->addModelTransformer(new CallbackTransformer(
                function($data) {

                    $item = new MediaGalleryItem();
                    $item->setImage($data['image'] ?? null);
                    $item->setGalleryorder($data['galleryorder'] ?? null);

                    return $item;
                },
                function($item) {

                    $data = [];

                    if ($item instanceof MediaGalleryItem) {

                        $data = [
                            'image' => $item->getImage(),
                            'galleryorder' => $item->getGalleryorder()
                        ];
                    }

                    return $data;
                }
        ));
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => MediaGalleryItem::class
        ]);
    }
}