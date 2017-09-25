<?php

namespace VideInfra\CMSBundle\Form\Type;

use A2lix\TranslationFormBundle\Form\Type\TranslationsType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\DataTransformerInterface;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use VideInfra\CMSBundle\Model\MediaGalleryItem;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaGalleryItemType extends AbstractType
{
    /** @var DataTransformerInterface */
    private $transformer;

    /**
     * MediaGalleryItemType constructor.
     * @param DataTransformerInterface $transformer
     */
    public function __construct(DataTransformerInterface $transformer)
    {
        $this->transformer = $transformer;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $locales = $options['locales'];

        $builder
            ->add('galleryorder', HiddenType::class)
            ->add('image', MediaImageType::class);

        if ($options['use_translations']) {
            $builder
                ->add('translations', TranslationsType::class, [
                    'locales' => $locales,
                    'label' => false,
                    'fields' => [
                        'title' => ['label' => 'Caption']
                    ]
                ]);
        }
        else {
            $builder->add('title');
        }

        $builder
            ->addModelTransformer($this->transformer);
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => MediaGalleryItem::class,
            'use_translations' => true,
            'locales' => ['en']
        ]);
    }
}