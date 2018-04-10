<?php

namespace Octave\CMSBundle\Form\Type;

use A2lix\TranslationFormBundle\Form\Type\TranslationsType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\DataTransformerInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Octave\CMSBundle\Model\MediaImage;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class BlockImageType extends AbstractType
{
    /** @var DataTransformerInterface */
    private $transformer;

    /**
     * MediaGalleryType constructor.
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
        $builder
            ->add('image', MediaImageType::class, [
                'label' => false,
                'show_label' => false
            ])
            ->add('translations', TranslationsType::class, [
                'label' => false,
                'locales' => $options['locales'],
                'fields' => [
                    'title' => ['field_type' => TextType::class, 'label' => 'Caption'],
                ]
            ])
        ;

        $builder->addModelTransformer($this->transformer);
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'locales' => ['en'],
            'data_class' => MediaImage::class,
        ]);
    }
}