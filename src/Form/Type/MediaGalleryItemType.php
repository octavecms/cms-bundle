<?php

namespace Octave\CMSBundle\Form\Type;

use A2lix\TranslationFormBundle\Form\Type\TranslationsType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\DataTransformerInterface;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Octave\CMSBundle\Model\MediaGalleryItem;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
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
            ->add($options['order_name'], HiddenType::class)
            ->add($options['image_name'], MediaImageType::class);

        if ($options['use_translations']) {
            $builder
                ->add('translations', TranslationsType::class, [
                    'locales' => $locales,
                    'label' => false,
                    'fields' => [
                        $options['title_name'] => ['label' => 'Caption']
                    ]
                ]);
        }
        else {
            $builder->add($options['title_name']);
        }

        $builder
            ->addModelTransformer($this->transformer);
    }

    /**
     * @param FormView $view
     * @param FormInterface $form
     * @param array $options
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        $view->vars['title_name'] = $options['title_name'];
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => MediaGalleryItem::class,
            'use_translations' => true,
            'locales' => ['en'],
            'image_name' => 'image',
            'title_name' => 'title',
            'order_name' => 'galleryorder'
        ]);
    }
}